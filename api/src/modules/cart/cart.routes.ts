import { Router } from 'express';
import type { Types } from 'mongoose';

import {
  getAuthenticatedUserId,
  requireAuth,
} from '../../shared/auth.middleware.js';
import Product from '../products/product.model.js';
import type { ProductRecord } from '../products/product.model.js';
import Cart from './cart.model.js';
import type { CartItemRecord } from './cart.model.js';
import { deleteUserCartDocument } from './cart.service.js';

interface CartItemReference {
  readonly productId?: unknown;
}

interface RequestedCartItem extends CartItemReference {
  readonly qty?: unknown;
}

type ProductSummaryDocument = Pick<
  ProductRecord,
  'title' | 'price' | 'images' | 'stock'
> & {
  readonly _id: Types.ObjectId;
};

type NormalizedCartItem = Required<
  Pick<CartItemRecord, 'productId' | 'title' | 'price' | 'image' | 'qty'>
>;

const router = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRequestedCartItems(requestBody: unknown): RequestedCartItem[] {
  if (!isRecord(requestBody) || !Array.isArray(requestBody.items)) {
    return [];
  }

  return requestBody.items.filter(isRecord).map((cartItem) => ({
    productId: cartItem.productId,
    qty: cartItem.qty,
  }));
}

function normalizeRequestedQuantity(quantityValue: unknown): number {
  const parsedQuantity = Number.parseInt(String(quantityValue), 10);

  return Number.isInteger(parsedQuantity) ? Math.max(1, parsedQuantity) : 1;
}

function getAvailableProductStock(productDocument: {
  readonly stock?: unknown;
}): number {
  return Math.max(0, Math.floor(Number(productDocument.stock) || 0));
}

async function getProductDocumentsById<TCartItem extends CartItemReference>(
  cartItems: readonly TCartItem[],
) {
  const productIds = cartItems
    .map((cartItem) => (cartItem.productId ? String(cartItem.productId) : ''))
    .filter(Boolean);

  const productDocuments = await Product.find({
    _id: {
      $in: productIds,
    },
  })
    .select('title price images stock')
    .lean();

  return new Map(
    productDocuments.map((productDocument) => [
      String(productDocument._id),
      productDocument,
    ]),
  );
}

function createCartResponse<
  TCartItem extends CartItemReference,
  TCartDocument extends {
    readonly items?: readonly TCartItem[] | null;
  },
>(
  cartDocument: TCartDocument,
  productDocumentsById: ReadonlyMap<string, ProductSummaryDocument>,
) {
  return {
    ...cartDocument,
    items: (cartDocument.items || []).map((cartItem) => {
      const productDocument = productDocumentsById.get(
        String(cartItem.productId),
      );

      const currentProductDetails = productDocument
        ? {
            title: productDocument.title,
            price: productDocument.price,
            image: productDocument.images?.[0] || '',
            stock: getAvailableProductStock(productDocument),
          }
        : {
            stock: 0,
          };

      return {
        ...cartItem,
        ...currentProductDetails,
      };
    }),
  };
}

function getCartItemQuantitiesByProductId<
  TCartItem extends Pick<CartItemRecord, 'productId' | 'qty'>,
  TCartDocument extends {
    readonly items?: readonly TCartItem[] | null;
  },
>(cartDocument: TCartDocument | null | undefined): Map<string, number> {
  return new Map(
    (cartDocument?.items || []).map((cartItem) => [
      String(cartItem.productId),
      Math.max(1, Number(cartItem.qty) || 1),
    ]),
  );
}

router.use(requireAuth);

// GET /api/cart
router.get('/', async (request, response, nextMiddleware) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const cartDocument = await Cart.findOne({
      userId,
    }).lean();

    if (!cartDocument) {
      return response.json({
        userId,
        items: [],
      });
    }

    const productDocumentsById = await getProductDocumentsById(
      cartDocument.items,
    );

    return response.json(
      createCartResponse(cartDocument, productDocumentsById),
    );
  } catch (error) {
    nextMiddleware(error);
  }
});

// PUT /api/cart  { items:[{productId, qty}] }
router.put('/', async (request, response, nextMiddleware) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const items = getRequestedCartItems(request.body);

    const existingCartDocument = await Cart.findOne({
      userId,
    }).lean();
    const existingCartItemQuantitiesByProductId =
      getCartItemQuantitiesByProductId(existingCartDocument);

    // нормализация: подтянем актуальные title/price с продуктов
    const productDocumentsById = await getProductDocumentsById(items);

    const normalizedCartItems: NormalizedCartItem[] = [];

    for (const requestedCartItem of items) {
      const productDocument = productDocumentsById.get(
        String(requestedCartItem.productId),
      );

      if (!productDocument) {
        continue;
      }

      const requestedQuantity = normalizeRequestedQuantity(
        requestedCartItem.qty,
      );
      const availableStock = getAvailableProductStock(productDocument);
      const existingQuantity =
        existingCartItemQuantitiesByProductId.get(
          String(productDocument._id),
        ) || 0;
      const maximumAllowedQuantity = Math.max(availableStock, existingQuantity);

      if (requestedQuantity > maximumAllowedQuantity) {
        return response.status(409).json({
          code: 'INSUFFICIENT_STOCK',
          message: `Недостаточно товара «${productDocument.title}» на складе`,
          productId: String(productDocument._id),
          requestedQuantity,
          availableStock,
          existingQuantity,
        });
      }

      normalizedCartItems.push({
        productId: productDocument._id,
        title: productDocument.title,
        price: productDocument.price,
        image: productDocument.images?.[0] || '',
        qty: requestedQuantity,
      });
    }

    if (normalizedCartItems.length === 0) {
      await deleteUserCartDocument(userId);

      return response.json({
        userId,
        items: [],
      });
    }

    const cartDocument = await Cart.findOneAndUpdate(
      {
        userId,
      },
      {
        $set: {
          items: normalizedCartItems,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      },
    ).lean();

    return response.json(
      createCartResponse(cartDocument, productDocumentsById),
    );
  } catch (error) {
    nextMiddleware(error);
  }
});

// Удаление товара из корзины
router.delete('/item/:productId', async (request, response, nextMiddleware) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { productId } = request.params;

    // Найдём корзину пользователя
    const cartDocument = await Cart.findOne({
      userId,
    });

    if (!cartDocument) {
      return response.json({
        userId,
        items: [],
      });
    }

    // Удаляем товар из массива
    for (
      let cartItemIndex = cartDocument.items.length - 1;
      cartItemIndex >= 0;
      cartItemIndex -= 1
    ) {
      const cartItem = cartDocument.items[cartItemIndex];

      if (String(cartItem.productId) === String(productId)) {
        cartDocument.items.splice(cartItemIndex, 1);
      }
    }

    if (cartDocument.items.length === 0) {
      await deleteUserCartDocument(userId);

      return response.json({
        userId,
        items: [],
      });
    }

    cartDocument.markModified('items');
    cartDocument.updatedAt = new Date();

    // Обновляем корзину в базе
    await cartDocument.save();

    const updatedCartDocument = cartDocument.toObject();
    const productDocumentsById = await getProductDocumentsById(
      updatedCartDocument.items,
    );

    return response.json(
      createCartResponse(updatedCartDocument, productDocumentsById),
    );
  } catch (error) {
    nextMiddleware(error);
  }
});

export default router;
