import { Button } from '../../../shared/ui';
import styles from './cart-summary.module.scss';

export const CartSummary = ({
  totalQuantity,
  totalSum,
  onCheckout,
  isCheckoutLoading = false,
}) => {
  return (
    <aside className={styles.summary}>
      <div className={styles.title}>Итого</div>
      <div className={styles.quantity}>Товаров: {totalQuantity}</div>
      <div className={styles.sum}>{totalSum} ₽</div>
      <Button
        type="button"
        className={styles.checkoutButton}
        onClick={onCheckout}
        disabled={totalQuantity === 0 || isCheckoutLoading}
      >
        {isCheckoutLoading ? 'Оформляем…' : 'Оформить заказ'}
      </Button>
    </aside>
  );
};
