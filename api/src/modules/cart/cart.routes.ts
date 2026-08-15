import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
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
  readonly productId: string;
  readonly qty: number;
}

interface ValidatedCartRequest {
  readonly isValid: true;
  readonly items: readonly RequestedCartItem[];
}

interface InvalidCartRequest {
  readonly isValid: false;
}

type CartRequestValidationResult = ValidatedCartRequest | InvalidCartRequest;

type ProductSummaryDocument = Pick<
  ProductRecord,
  'title' | 'price' | 'images' | 'stock'
> & {
  readonly _id: Types.ObjectId;
};

type NormalizedCartItem = Required<
  Pick<CartItemRecord, 'productId' | 'title' | 'price' | 'image' | 'qty'>
>;

interface CartItemResponse {
  readonly productId: string;
  readonly title: string;
  readonly price: number;
  readonly image?: string;
  readonly stock: number;
  readonly qty: number;
}

interface CartResponse {
  readonly userId: string;
  readonly items: readonly CartItemResponse[];
}

const router = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateCartRequest(
  requestBody: unknown,
): CartRequestValidationResult {
  if (!isRecord(requestBody) || !Array.isArray(requestBody.items)) {
    return {
      isValid: false,
    };
  }

  const requestedCartItems: RequestedCartItem[] = [];

  for (const cartItem of requestBody.items) {
    if (
      !isRecord(cartItem) ||
      typeof cartItem.productId !== 'string' ||
      !isValidObjectId(cartItem.productId) ||
      typeof cartItem.qty !== 'number' ||
      !Number.isInteger(cartItem.qty) ||
      cartItem.qty < 1
    ) {
      return {
        isValid: false,
      };
    }

    requestedCartItems.push({
      productId: cartItem.productId,
      qty: cartItem.qty,
    });
  }

  return {
    isValid: true,
    items: requestedCartItems,
  };
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

function createCartResponse(
  userId: string,
  cartItems: readonly CartItemRecord[],
  productDocumentsById: ReadonlyMap<string, ProductSummaryDocument>,
): CartResponse {
  return {
    userId,
    items: cartItems.map((cartItem) => {
      const productDocument = productDocumentsById.get(
        String(cartItem.productId),
      );

      const image = productDocument
        ? productDocument.images?.[0] || ''
        : (cartItem.image ?? undefined);

      return {
        productId: String(cartItem.productId),
        title: productDocument?.title ?? cartItem.title ?? '',
        price: productDocument?.price ?? cartItem.price ?? 0,
        ...(image === undefined ? {} : { image }),
        stock: productDocument ? getAvailableProductStock(productDocument) : 0,
        qty: Math.max(1, Number(cartItem.qty) || 1),
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
      createCartResponse(userId, cartDocument.items, productDocumentsById),
    );
  } catch (error) {
    nextMiddleware(error);
  }
});

// PUT /api/cart  { items:[{productId, qty}] }
router.put('/', async (request, response, nextMiddleware) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const cartRequestValidationResult = validateCartRequest(request.body);

    if (!cartRequestValidationResult.isValid) {
      return response.status(400).json({
        code: 'CART_INPUT_INVALID',
        message: 'Invalid cart input',
      });
    }

    const items = cartRequestValidationResult.items;

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

      const requestedQuantity = requestedCartItem.qty;
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
      createCartResponse(userId, cartDocument.items, productDocumentsById),
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
      createCartResponse(
        userId,
        updatedCartDocument.items,
        productDocumentsById,
      ),
    );
  } catch (error) {
    nextMiddleware(error);
  }
});

export default router;
