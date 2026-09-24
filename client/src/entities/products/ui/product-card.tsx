import { Link } from 'react-router-dom';

import {
  getProductImageSources,
  replaceBrokenProductImageWithFallback,
} from '@shared/lib';
import { Button } from '@shared/ui';

import type { Product } from '../model/product.types';
import styles from './product-card.module.scss';

interface ProductCardProps {
  readonly product: Product;
  readonly currentCartQuantity?: number;
  readonly onAddToCart: (product: Product) => void;
}

export const ProductCard = ({
  product,
  currentCartQuantity = 0,
  onAddToCart,
}: ProductCardProps) => {
  const { primaryUrl: productImageUrl, fallbackUrl: productImageFallbackUrl } =
    getProductImageSources(product.images?.[0]);
  const availableStock = Math.max(0, Number(product.stock) || 0);
  const isOutOfStock = availableStock === 0;
  const isMaximumInCart =
    !isOutOfStock && currentCartQuantity >= availableStock;
  const isAddToCartDisabled = isOutOfStock || isMaximumInCart;

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
          data-fallback-src={productImageFallbackUrl}
          alt={product.title}
          className={styles.image}
          loading="lazy"
          decoding="async"
          onError={replaceBrokenProductImageWithFallback}
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
          {isOutOfStock ? (
            'Нет в наличии'
          ) : isMaximumInCart ? (
            <span className={styles.maximumInCartLabel}>
              Максимум
              <br />в корзине
            </span>
          ) : (
            'В корзину'
          )}
        </Button>
      </div>
    </div>
  );
};
