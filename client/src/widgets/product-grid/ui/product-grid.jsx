import { useDispatch } from 'react-redux';
import { ProductCard } from '../../../entities/products';
import { addProductToCart } from '../../../features/cart';
import styles from './product-grid.module.scss';

export const ProductGrid = ({ products = [] }) => {
  const dispatch = useDispatch();

  function handleAddProductToCart(product) {
    dispatch(
      addProductToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0],
      }),
    );
  }

  return (
    <div className={styles.productGrid}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={handleAddProductToCart}
        />
      ))}
    </div>
  );
};
