import { useDispatch, useSelector } from 'react-redux';
import { ProductCard } from '../../../entities/products';
import {
  addProductToCart,
  createCartItemFromProduct,
} from '../../../features/cart';
import styles from './product-grid.module.scss';

export const ProductGrid = ({ products = [] }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => Boolean(state.auth.user));

  function handleAddProductToCart(product) {
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
