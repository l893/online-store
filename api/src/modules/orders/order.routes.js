const router = require('express').Router();
const { requireAuth } = require('../../shared/auth.middleware');
const Cart = require('../cart/cart.model');
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

// POST /api/checkout/confirm  { orderId }
router.post('/checkout/confirm', async (req, res, next) => {
  try {
    const { orderId } = req.body || {};

    if (!orderId) return res.status(400).json({ message: 'orderId required' });

    const order = await Order.findOne({ _id: orderId, userId: req.user.id });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'paid')
      return res.json({ ok: true, status: order.status });

    order.status = 'paid';
    await order.save();

    // очистим серверную корзину
    await Cart.updateOne(
      { userId: req.user.id },
      { $set: { items: [], updatedAt: new Date() } },
    );

    res.json({ ok: true, status: 'paid' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
