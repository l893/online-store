import { Link } from 'react-router-dom';

import {
  PRODUCT_IMAGE_PLACEHOLDER_URL,
  replaceBrokenProductImageWithPlaceholder,
} from '@shared/lib';
import { Button } from '@shared/ui';

import type { Product } from '../model/product.types';
import styles from './product-card.module.scss';

interface ProductCardProps {
  readonly product: Product;
  readonly isAddToCartDisabled?: boolean;
  readonly onAddToCart: (product: Product) => void;
}

export const ProductCard = ({
  product,
  isAddToCartDisabled = false,
  onAddToCart,
}: ProductCardProps) => {
  const productImageUrl = product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER_URL;

  function handleAddToCartButtonClick(): void {
    onAddToCart(product);
  }

  return (
    <div className={styles.productCard}>
      <Link
        to={`/product/${product.slug}`}
        className={styles.imageWrapper}
        aria-label={`Открыть товар «${product.title}»`}
      >
        <img
          src={productImageUrl}
          alt={product.title}
          className={styles.image}
          loading="lazy"
          onError={replaceBrokenProductImageWithPlaceholder}
        />
      </Link>

      <div className={styles.content}>
        <Link to={`/product/${product.slug}`} className={styles.titleLink}>
          {product.title}
        </Link>
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
