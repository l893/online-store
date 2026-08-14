import { Button } from '@shared/ui';

import styles from './cart-summary.module.scss';

interface CartSummaryProps {
  readonly totalQuantity: number;
  readonly totalSum: number;
  readonly availabilityMessage?: string;
  readonly hideTotals?: boolean;
  readonly isCheckoutDisabled?: boolean;
  readonly onCheckout: () => void | Promise<void>;
  readonly isCheckoutLoading?: boolean;
}

export const CartSummary = ({
  totalQuantity,
  totalSum,
  availabilityMessage = '',
  hideTotals = false,
  isCheckoutDisabled = false,
  onCheckout,
  isCheckoutLoading = false,
}: CartSummaryProps) => {
  return (
    <aside className={styles.summary}>
      <div className={styles.title}>Итого</div>

      {availabilityMessage && (
        <div
          className={styles.availabilityMessage}
          role="status"
          aria-live="polite"
        >
          {availabilityMessage}
        </div>
      )}

      {!hideTotals && (
        <>
          <div className={styles.quantity}>Товаров: {totalQuantity}</div>
          <div className={styles.sum}>{totalSum} ₽</div>
        </>
      )}

      <Button
        type="button"
        className={styles.checkoutButton}
        onClick={onCheckout}
        disabled={
          totalQuantity === 0 || isCheckoutLoading || isCheckoutDisabled
        }
      >
        {isCheckoutLoading ? 'Оформляем…' : 'Оформить заказ'}
      </Button>
    </aside>
  );
};
