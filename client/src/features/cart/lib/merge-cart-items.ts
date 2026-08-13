import type { ProductAvailabilityItem } from '@entities/products';

import { applyProductDetailsToCartItems } from './apply-product-details-to-cart-items';
import type { CartItem } from '../model/cart.types';

interface MergeCartItemsOptions {
  readonly serverCartItems?: readonly CartItem[];
  readonly localCartItems?: readonly CartItem[];
  readonly productAvailabilityItems?: readonly ProductAvailabilityItem[];
}

function normalizeCartItemQuantity(cartItem: CartItem): number {
  return Math.max(1, Number(cartItem.qty) || 1);
}

function createProductStockById(
  productAvailabilityItems: readonly ProductAvailabilityItem[],
): Map<string, number> {
  return new Map<string, number>(
    productAvailabilityItems.map((productAvailabilityItem) => [
      productAvailabilityItem.productId,
      Math.max(0, Number(productAvailabilityItem.stock) || 0),
    ]),
  );
}

export function mergeCartItems({
  serverCartItems = [],
  localCartItems = [],
  productAvailabilityItems = [],
}: MergeCartItemsOptions): CartItem[] {
  const mergedItemsByProductId = new Map<string, CartItem>();
  const productStockById = createProductStockById(productAvailabilityItems);

  for (const serverCartItem of serverCartItems) {
    if (!serverCartItem?.productId) {
      continue;
    }

    const availableStock = productStockById.get(serverCartItem.productId) ?? 0;

    mergedItemsByProductId.set(serverCartItem.productId, {
      ...serverCartItem,
      stock: availableStock,
      qty: normalizeCartItemQuantity(serverCartItem),
    });
  }

  for (const localCartItem of localCartItems) {
    if (!localCartItem?.productId) {
      continue;
    }

    const availableStock = productStockById.get(localCartItem.productId) ?? 0;
    const localQuantity = normalizeCartItemQuantity(localCartItem);
    const existingCartItem = mergedItemsByProductId.get(
      localCartItem.productId,
    );

    if (!existingCartItem) {
      if (availableStock === 0) {
        continue;
      }

      mergedItemsByProductId.set(localCartItem.productId, {
        ...localCartItem,
        stock: availableStock,
        qty: Math.min(localQuantity, availableStock),
      });

      continue;
    }

    const maximumAllowedQuantity = Math.max(
      availableStock,
      existingCartItem.qty,
    );

    mergedItemsByProductId.set(localCartItem.productId, {
      ...localCartItem,
      ...existingCartItem,
      stock: availableStock,
      qty: Math.min(
        existingCartItem.qty + localQuantity,
        maximumAllowedQuantity,
      ),
    });
  }

  return applyProductDetailsToCartItems(
    Array.from(mergedItemsByProductId.values()),
    productAvailabilityItems,
  );
}
