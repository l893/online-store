import { Button } from '../shared/ui/button';
import styles from './cart-summary.module.scss';

export const CartSummary = ({ totalQty, totalSum, onCheckout }) => {
  return (
    <aside className={styles.summary}>
      <div className={styles.title}>Итого</div>
      <div className={styles.quantity}>Товаров: {totalQty}</div>
      <div className={styles.sum}>{totalSum} ₽</div>
      <Button
        type="button"
        className={styles.checkoutButton}
        onClick={onCheckout}
        disabled={totalQty === 0}
      >
        Оформить заказ
      </Button>
    </aside>
  );
};
