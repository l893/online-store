import { useDispatch, useSelector } from 'react-redux';

import { ProductCard } from '@entities/products';
import type { Product } from '@entities/products';
import { selectAuthenticatedUser } from '@features/auth';
import {
  addProductToCart,
  createCartItemFromProduct,
  selectCartItems,
} from '@features/cart';
import type { CartOrchestrationDispatch } from '@features/cart';

import styles from './product-grid.module.scss';

interface ProductGridProps {
  readonly products?: readonly Product[];
}

export const ProductGrid = ({ products = [] }: ProductGridProps) => {
  const dispatch = useDispatch<CartOrchestrationDispatch>();
  const cartItems = useSelector(selectCartItems);
  const authenticatedUser = useSelector(selectAuthenticatedUser);
  const isAuthenticated = Boolean(authenticatedUser);

  function handleAddProductToCart(product: Product): void {
    dispatch(
      addProductToCart({
        cartItem: createCartItemFromProduct(product),
        isAuthenticated,
      }),
    );
  }

  if (products.length === 0) {
    return <div className={styles.emptyState}>Нет данных</div>;
  }

  return (
    <div className={styles.productGrid}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isAddToCartDisabled={
            (cartItems.find((cartItem) => cartItem.productId === product._id)
              ?.qty || 0) >= Math.max(0, Number(product.stock) || 0)
          }
          onAddToCart={handleAddProductToCart}
        />
      ))}
    </div>
  );
};
