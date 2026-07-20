import { Button, Input } from '../../../shared/ui';
import styles from './cart-item.module.scss';

const CART_ITEM_IMAGE_PLACEHOLDER_URL =
  'https://placehold.co/300x300?text=No+Image';

export const CartItem = ({ item, onChangeQty, onRemove }) => {
  const itemImageUrl = item.image || CART_ITEM_IMAGE_PLACEHOLDER_URL;

  const handleQuantityInputChange = (event) => {
    const nextQuantity = Math.max(1, parseInt(event.target.value || '1', 10));

    onChangeQty(item.productId, nextQuantity);
  };

  const handleItemImageError = (event) => {
    event.currentTarget.src = CART_ITEM_IMAGE_PLACEHOLDER_URL;
  };

  return (
    <div className={styles.cartItem}>
      <div className={styles.imageWrapper}>
        <img
          src={itemImageUrl}
          alt={item.title}
          className={styles.image}
          loading="lazy"
          onError={handleItemImageError}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.title}>{item.title}</div>
        <div className={styles.productId}>id: {item.productId}</div>
      </div>

      <div className={styles.quantityControls}>
        <Button
          type="button"
          onClick={() => onChangeQty(item.productId, item.qty - 1)}
        >
          -
        </Button>
        <Input
          className={styles.quantityInput}
          fullWidth={false}
          type="number"
          value={item.qty}
          onChange={handleQuantityInputChange}
          slotProps={{
            htmlInput: {
              'aria-label': `Количество товара ${item.title}`,
              min: 1,
            },
          }}
        />
        <Button
          type="button"
          onClick={() => onChangeQty(item.productId, item.qty + 1)}
        >
          +
        </Button>
      </div>

      <div className={styles.price}>{item.price * item.qty} ₽</div>

      <button
        type="button"
        aria-label={`Удалить товар ${item.title} из корзины`}
        className={styles.removeButton}
        onClick={() => onRemove(item.productId)}
      >
        ✕
      </button>
    </div>
  );
};
