import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductQuery } from '../../../entities/products';
import { addProductToCart } from '../../../features/cart';
import { Button, Loader } from '../../../shared/ui';
import styles from './product-page.module.scss';

const PRODUCT_IMAGE_PLACEHOLDER_URL =
  'https://placehold.co/600x600?text=No+Image';

export const ProductPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetProductQuery(slug, {
    skip: !slug,
  });

  if (!slug) {
    return <div className={styles.pageMessage}>Товар не найден</div>;
  }

  if (isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorMessage}>
        Ошибка при загрузке товара:{' '}
        {error?.data?.message || 'неизвестная ошибка'}
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
    dispatch(
      addProductToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0],
        stock: availableStock,
      }),
    );
  };

  const handleProductImageError = (event) => {
    event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER_URL;
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
            onError={handleProductImageError}
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
