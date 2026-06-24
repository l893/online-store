import { ProductCard } from '../entities/products';
import styles from './product-grid.module.scss';

export const ProductGrid = ({ items }) => {
  return (
    <div className={styles.productGrid}>
      {items?.map((product) => (
        <ProductCard key={product._id} p={product} />
      ))}
    </div>
  );
};
