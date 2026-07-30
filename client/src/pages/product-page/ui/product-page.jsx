import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductQuery } from '../../../entities/products';
import {
  addProductToCart,
  createCartItemFromProduct,
} from '../../../features/cart';
import {
  PRODUCT_IMAGE_PLACEHOLDER_URL,
  replaceBrokenProductImageWithPlaceholder,
} from '../../../shared/lib';
import { Button, Loader } from '../../../shared/ui';
import styles from './product-page.module.scss';

export const ProductPage = () => {
  const { slug: productSlug } = useParams();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
    error: productError,
  } = useGetProductQuery(productSlug, {
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
        Ошибка при загрузке товара:{' '}
        {productError?.data?.message || 'неизвестная ошибка'}
      </div>
    );
  }

  if (!product) {
    return <div className={styles.pageMessage}>Товар не найден</div>;
  }

  const productImageUrl = product.images?.[0] || PRODUCT_IMAGE_PLACEHOLDER_URL;
  const availableStock = Math.max(0, Number(product.stock) || 0);
  const currentCartItem = cartItems.find(
    (cartItem) => cartItem.productId === product._id,
  );
  const isAddToCartButtonDisabled =
    (currentCartItem?.qty || 0) >= availableStock;

  const handleAddToCartButtonClick = () => {
    dispatch(addProductToCart(createCartItemFromProduct(product)));
  };

  return (
    <section className={styles.productPage}>
      <div className={styles.productDetailsCard}>
        <div className={styles.imageWrapper}>
          <img
            src={productImageUrl}
            alt={product.title}
            className={styles.productImage}
            loading="eager"
            onError={replaceBrokenProductImageWithPlaceholder}
          />
        </div>

        <div className={styles.content}>
          <div>
            <h1 className={styles.title}>{product.title}</h1>
            <p className={styles.productId}>id товара: {product._id}</p>
          </div>

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
