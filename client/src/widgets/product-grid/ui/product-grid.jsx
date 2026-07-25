import { useDispatch, useSelector } from 'react-redux';
import { ProductCard } from '../../../entities/products';
import { addProductToCart } from '../../../features/cart';
import styles from './product-grid.module.scss';

export const ProductGrid = ({ products = [] }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  function handleAddProductToCart(product) {
    dispatch(
      addProductToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0],
        stock: product.stock,
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
