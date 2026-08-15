import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import type { Types } from 'mongoose';

import {
  getAuthenticatedUserId,
  requireAuth,
} from '../../shared/auth.middleware.js';
import Cart from '../cart/cart.model.js';
import type { CartItemRecord } from '../cart/cart.model.js';
import { deleteUserCartDocument } from '../cart/cart.service.js';
import Product from '../products/product.model.js';
import Order from './order.model.js';
import type { OrderItemRecord } from './order.model.js';

interface RequestedOrderItem {
  readonly productId: string;
  readonly titleSnapshot?: string | null;
  requestedQuantity: number;
}

interface ReservedStockItem {
  readonly productId: Types.ObjectId;
  readonly quantity: number;
}

interface RollbackOrderCheckoutOptions {
  readonly orderId: Types.ObjectId;
  readonly reservedStockItems: readonly ReservedStockItem[];
}

const router = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getOrderId(requestBody: unknown): string | undefined {
  if (!isRecord(requestBody)) {
    return undefined;
  }

  return typeof requestBody.orderId === 'string' && requestBody.orderId
    ? requestBody.orderId
    : undefined;
}

function getRequiredMapValue<T>(
  valuesById: ReadonlyMap<string, T>,
  identifier: string,
): T {
  const value = valuesById.get(identifier);

  if (value === undefined) {
    throw new Error(`Required value not found for id: ${identifier}`);
  }

  return value;
}

function getAvailableProductStock(productDocument: {
  readonly stock?: unknown;
}): number {
  return Math.max(0, Math.floor(Number(productDocument.stock) || 0));
}

function createRequestedCartItems(
  cartItems: readonly CartItemRecord[],
): RequestedOrderItem[] {
  const requestedCartItemsByProductId = new Map<string, RequestedOrderItem>();

  for (const cartItem of cartItems) {
    if (!cartItem?.productId) {
      continue;
    }

    const productId = String(cartItem.productId);
    const parsedQuantity = Number.parseInt(String(cartItem.qty), 10);
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

function normalizeOrderItemQuantity(
  orderItem: Pick<OrderItemRecord, 'qty'>,
): number {
  return Math.max(1, Math.floor(Number(orderItem.qty) || 1));
}

async function restoreReservedProductStock(
  reservedStockItems: readonly ReservedStockItem[],
): Promise<void> {
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

async function rollbackOrderCheckout({
  orderId,
  reservedStockItems,
}: RollbackOrderCheckoutOptions): Promise<void> {
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
router.post('/', async (request, response, nextMiddleware) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const cartDocument = await Cart.findOne({
      userId,
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
      const productDocument = getRequiredMapValue(
        productDocumentsById,
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
      userId,
      items: orderItems,
      total,
      status: 'draft',
    });

    return response.json({
      orderId: orderDocument._id.toString(),
      total,
    });
  } catch (error: unknown) {
    nextMiddleware(error);
  }
});

// POST /api/orders/checkout/confirm  { orderId }
router.post('/checkout/confirm', async (request, response, nextMiddleware) => {
  const reservedStockItems: ReservedStockItem[] = [];
  let claimedOrderId: Types.ObjectId | undefined;
  let isOrderPaid = false;

  try {
    const userId = getAuthenticatedUserId(request);
    const orderId = getOrderId(request.body);

    if (!orderId) {
      return response.status(400).json({
        message: 'orderId required',
      });
    }

    if (!isValidObjectId(orderId)) {
      return response.status(400).json({
        code: 'ORDER_ID_INVALID',
        message: 'Invalid orderId',
      });
    }

    const claimedOrderDocument = await Order.findOneAndUpdate(
      {
        _id: orderId,
        userId,
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
        userId,
      }).lean();

      if (!existingOrderDocument) {
        return response.status(404).json({
          message: 'Order not found',
        });
      }

      if (existingOrderDocument.status === 'paid') {
        await deleteUserCartDocument(userId);

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

    claimedOrderId = claimedOrderDocument._id;

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
          orderId: claimedOrderId,
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
        _id: claimedOrderId,
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
        orderId: claimedOrderId,
        reservedStockItems,
      });

      return response.status(409).json({
        code: 'ORDER_STATE_CONFLICT',
        message: 'Статус заказа изменился во время подтверждения',
      });
    }

    isOrderPaid = true;

    await deleteUserCartDocument(userId);

    return response.json({
      ok: true,
      status: 'paid',
    });
  } catch (error: unknown) {
    if (claimedOrderId && !isOrderPaid) {
      try {
        await rollbackOrderCheckout({
          orderId: claimedOrderId,
          reservedStockItems,
        });
      } catch (rollbackError: unknown) {
        nextMiddleware(rollbackError);
        return;
      }
    }

    nextMiddleware(error);
  }
});

export default router;
