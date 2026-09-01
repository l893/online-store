import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { useGetProductQuery } from '@entities/products';
import { selectAuthenticatedUser } from '@features/auth';
import {
  addProductToCart,
  createCartItemFromProduct,
  selectCartItems,
} from '@features/cart';
import type { CartOrchestrationDispatch } from '@features/cart';
import {
  getProductImageSources,
  replaceBrokenProductImageWithFallback,
} from '@shared/lib';
import { Button, Loader } from '@shared/ui';

import styles from './product-page.module.scss';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getProductErrorMessage(error: unknown): string {
  if (
    isRecord(error) &&
    isRecord(error.data) &&
    typeof error.data.message === 'string' &&
    error.data.message
  ) {
    return error.data.message;
  }

  return 'неизвестная ошибка';
}

export const ProductPage = () => {
  const { slug: productSlug } = useParams();
  const dispatch = useDispatch<CartOrchestrationDispatch>();
  const cartItems = useSelector(selectCartItems);
  const authenticatedUser = useSelector(selectAuthenticatedUser);
  const isAuthenticated = Boolean(authenticatedUser);

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
    error: productError,
  } = useGetProductQuery(productSlug ?? '', {
    skip: !productSlug,
  });

  if (!productSlug) {
    return <div className={styles.pageMessage}>Товар не найден</div>;
  }

  if (isProductLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <Loader />
      </div>
    );
  }

  if (isProductError) {
    return (
      <div className={styles.errorMessage}>
        Ошибка при загрузке товара: {getProductErrorMessage(productError)}
      </div>
    );
  }

  if (!product) {
    return <div className={styles.pageMessage}>Товар не найден</div>;
  }

  const { primaryUrl: productImageUrl, fallbackUrl: productImageFallbackUrl } =
    getProductImageSources(product.images?.[0]);
  const availableStock = Math.max(0, Number(product.stock) || 0);
  const currentCartItem = cartItems.find(
    (cartItem) => cartItem.productId === product._id,
  );
  const isAddToCartButtonDisabled =
    (currentCartItem?.qty || 0) >= availableStock;

  const handleAddToCartButtonClick = (): void => {
    dispatch(
      addProductToCart({
        cartItem: createCartItemFromProduct(product),
        isAuthenticated,
      }),
    );
  };

  return (
    <section className={styles.productPage}>
      <div className={styles.productDetailsCard}>
        <div className={styles.imageWrapper}>
          <img
            src={productImageUrl}
            data-fallback-src={productImageFallbackUrl}
            alt={product.title}
            className={styles.productImage}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={replaceBrokenProductImageWithFallback}
          />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>{product.title}</h1>

          <div className={styles.productMeta}>
            <div>
              <span className={styles.metaLabel}>Количество:</span>{' '}
              {typeof product.stock === 'number' ? product.stock : '—'}
            </div>
            <div>
              <span className={styles.metaLabel}>Стоимость:</span>{' '}
              {product.price?.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            disabled={isAddToCartButtonDisabled}
            onClick={handleAddToCartButtonClick}
          >
            {isAddToCartButtonDisabled ? 'Максимум в корзине' : 'Купить'}
          </Button>
        </div>
      </div>
    </section>
  );
};
