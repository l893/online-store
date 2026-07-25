import { Button } from '../../../shared/ui';
import { Link } from 'react-router-dom';
import styles from './product-card.module.scss';

const PRODUCT_IMAGE_PLACEHOLDER_URL =
  'https://placehold.co/300x300?text=No+Image';

export const ProductCard = ({
  product,
  isAddToCartDisabled = false,
  onAddToCart,
}) => {
  const productImageUrl = product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER_URL;

  function handleAddToCartButtonClick() {
    onAddToCart(product);
  }

  return (
    <div className={styles.productCard}>
      <div className={styles.imageWrapper}>
        <img
          src={productImageUrl}
          alt={product.title}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <Link to={`/product/${product.slug}`} className={styles.titleLink}>
          {product.title}
        </Link>
        <div className={styles.productId}>id: {product._id}</div>
        <div className={styles.price}>{product.price} ₽</div>
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          disabled={isAddToCartDisabled}
          onClick={handleAddToCartButtonClick}
        >
          {isAddToCartDisabled ? 'Максимум в корзине' : 'В корзину'}
        </Button>
      </div>
    </div>
  );
};
