const router = require('express').Router();
const { requireAuth } = require('../../shared/auth.middleware');
const Cart = require('../cart/cart.model');
const { deleteUserCartDocument } = require('../cart/cart.service');
const Product = require('../products/product.model');
const Order = require('./order.model');

function getAvailableProductStock(productDocument) {
  return Math.max(0, Math.floor(Number(productDocument.stock) || 0));
}

function createRequestedCartItems(cartItems) {
  const requestedCartItemsByProductId = new Map();

  for (const cartItem of cartItems) {
    if (!cartItem?.productId) {
      continue;
    }

    const productId = String(cartItem.productId);
    const parsedQuantity = Number.parseInt(cartItem.qty, 10);
    const requestedQuantity = Number.isInteger(parsedQuantity)
      ? Math.max(1, parsedQuantity)
      : 1;
    const existingRequestedCartItem =
      requestedCartItemsByProductId.get(productId);

    if (existingRequestedCartItem) {
      existingRequestedCartItem.requestedQuantity += requestedQuantity;
      continue;
    }

    requestedCartItemsByProductId.set(productId, {
      productId,
      titleSnapshot: cartItem.title,
      requestedQuantity,
    });
  }

  return Array.from(requestedCartItemsByProductId.values());
}

function normalizeOrderItemQuantity(orderItem) {
  return Math.max(1, Math.floor(Number(orderItem.qty) || 1));
}

async function restoreReservedProductStock(reservedStockItems) {
  if (reservedStockItems.length === 0) {
    return;
  }

  await Product.bulkWrite(
    reservedStockItems.map((reservedStockItem) => ({
      updateOne: {
        filter: {
          _id: reservedStockItem.productId,
        },
        update: {
          $inc: {
            stock: reservedStockItem.quantity,
          },
        },
      },
    })),
  );
}

async function rollbackOrderCheckout({ orderId, reservedStockItems }) {
  await restoreReservedProductStock(reservedStockItems);

  await Order.updateOne(
    {
      _id: orderId,
      status: 'processing',
    },
    {
      $set: {
        status: 'draft',
      },
    },
  );
}

router.use(requireAuth);

// POST /api/orders
router.post('/', async (request, response, next) => {
  try {
    const cartDocument = await Cart.findOne({
      userId: request.user.id,
    }).lean();
    const requestedCartItems = createRequestedCartItems(
      cartDocument?.items || [],
    );

    if (requestedCartItems.length === 0) {
      return response.status(400).json({
        message: 'Cart is empty',
      });
    }

    const productIds = requestedCartItems.map(
      (requestedCartItem) => requestedCartItem.productId,
    );
    const productDocuments = await Product.find({
      _id: {
        $in: productIds,
      },
    })
      .select('title price images stock')
      .lean();
    const productDocumentsById = new Map(
      productDocuments.map((productDocument) => [
        String(productDocument._id),
        productDocument,
      ]),
    );

    const stockConflicts = requestedCartItems.flatMap((requestedCartItem) => {
      const productDocument = productDocumentsById.get(
        requestedCartItem.productId,
      );
      const availableStock = productDocument
        ? getAvailableProductStock(productDocument)
        : 0;

      if (
        productDocument &&
        requestedCartItem.requestedQuantity <= availableStock
      ) {
        return [];
      }

      return [
        {
          productId: requestedCartItem.productId,
          title:
            productDocument?.title ||
            requestedCartItem.titleSnapshot ||
            'Неизвестный товар',
          requestedQuantity: requestedCartItem.requestedQuantity,
          availableStock,
        },
      ];
    });

    if (stockConflicts.length > 0) {
      return response.status(409).json({
        code: 'ORDER_STOCK_CONFLICT',
        message: 'Некоторые товары недоступны в выбранном количестве',
        items: stockConflicts,
      });
    }

    const orderItems = requestedCartItems.map((requestedCartItem) => {
      const productDocument = productDocumentsById.get(
        requestedCartItem.productId,
      );

      return {
        productId: productDocument._id,
        titleSnapshot: productDocument.title,
        priceSnapshot: productDocument.price,
        qty: requestedCartItem.requestedQuantity,
        image: productDocument.images?.[0] || '',
      };
    });
    const total = orderItems.reduce(
      (totalSum, orderItem) =>
        totalSum + orderItem.priceSnapshot * orderItem.qty,
      0,
    );
    const orderDocument = await Order.create({
      userId: request.user.id,
      items: orderItems,
      total,
      status: 'draft',
    });

    return response.json({
      orderId: orderDocument._id,
      total,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/checkout/confirm  { orderId }
router.post('/checkout/confirm', async (request, response, next) => {
  const reservedStockItems = [];
  let claimedOrderDocument = null;
  let isOrderPaid = false;

  try {
    const { orderId } = request.body || {};

    if (!orderId) {
      return response.status(400).json({
        message: 'orderId required',
      });
    }

    claimedOrderDocument = await Order.findOneAndUpdate(
      {
        _id: orderId,
        userId: request.user.id,
        status: 'draft',
      },
      {
        $set: {
          status: 'processing',
        },
      },
      {
        new: true,
      },
    );

    if (!claimedOrderDocument) {
      const existingOrderDocument = await Order.findOne({
        _id: orderId,
        userId: request.user.id,
      }).lean();

      if (!existingOrderDocument) {
        return response.status(404).json({
          message: 'Order not found',
        });
      }

      if (existingOrderDocument.status === 'paid') {
        await deleteUserCartDocument(request.user.id);

        return response.json({
          ok: true,
          status: 'paid',
        });
      }

      if (existingOrderDocument.status === 'processing') {
        return response.status(409).json({
          code: 'ORDER_CHECKOUT_IN_PROGRESS',
          message: 'Подтверждение заказа уже выполняется',
        });
      }

      return response.status(409).json({
        code: 'ORDER_NOT_CONFIRMABLE',
        message: 'Заказ нельзя подтвердить в текущем статусе',
      });
    }

    for (const orderItem of claimedOrderDocument.items) {
      const requestedQuantity = normalizeOrderItemQuantity(orderItem);

      const updatedProductDocument = await Product.findOneAndUpdate(
        {
          _id: orderItem.productId,
          stock: {
            $gte: requestedQuantity,
          },
        },
        {
          $inc: {
            stock: -requestedQuantity,
          },
        },
        {
          new: true,
        },
      )
        .select('_id title stock')
        .lean();

      if (!updatedProductDocument) {
        const currentProductDocument = await Product.findById(
          orderItem.productId,
        )
          .select('title stock')
          .lean();

        await rollbackOrderCheckout({
          orderId: claimedOrderDocument._id,
          reservedStockItems,
        });

        return response.status(409).json({
          code: 'ORDER_STOCK_CONFLICT',
          message: 'Некоторые товары недоступны в выбранном количестве',
          items: [
            {
              productId: String(orderItem.productId),
              title:
                currentProductDocument?.title ||
                orderItem.titleSnapshot ||
                'Неизвестный товар',
              requestedQuantity,
              availableStock: currentProductDocument
                ? getAvailableProductStock(currentProductDocument)
                : 0,
            },
          ],
        });
      }

      reservedStockItems.push({
        productId: updatedProductDocument._id,
        quantity: requestedQuantity,
      });
    }

    const paidOrderDocument = await Order.findOneAndUpdate(
      {
        _id: claimedOrderDocument._id,
        status: 'processing',
      },
      {
        $set: {
          status: 'paid',
        },
      },
      {
        new: true,
      },
    ).lean();

    if (!paidOrderDocument) {
      await rollbackOrderCheckout({
        orderId: claimedOrderDocument._id,
        reservedStockItems,
      });

      return response.status(409).json({
        code: 'ORDER_STATE_CONFLICT',
        message: 'Статус заказа изменился во время подтверждения',
      });
    }

    isOrderPaid = true;

    await deleteUserCartDocument(request.user.id);

    return response.json({
      ok: true,
      status: 'paid',
    });
  } catch (error) {
    if (claimedOrderDocument && !isOrderPaid) {
      try {
        await rollbackOrderCheckout({
          orderId: claimedOrderDocument._id,
          reservedStockItems,
        });
      } catch (rollbackError) {
        return next(rollbackError);
      }
    }

    next(error);
  }
});

module.exports = router;
