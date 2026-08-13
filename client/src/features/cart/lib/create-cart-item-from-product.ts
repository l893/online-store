import type { Product } from '@entities/products';

import type { CartItemDraft } from '../model/cart.types';

export function createCartItemFromProduct(product: Product): CartItemDraft {
  return {
    productId: product._id,
    title: product.title,
    price: product.price,
    image: product.images?.[0],
    stock: Math.max(0, Number(product.stock) || 0),
  };
}
