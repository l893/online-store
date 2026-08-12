import { useSelector } from 'react-redux';
import { useCartItemActions } from '@features/cart';
import { AlertDialog, Loader } from '@shared/ui';
import { CartItem } from '@widgets/cart-item';
import { CartSummary } from '@widgets/cart-summary';
import { useCartCheckout } from '../model/use-cart-checkout';
import { useCartPageState } from '../model/use-cart-page-state';
import styles from './cart-page.module.scss';

export const CartPage = () => {
  const user = useSelector((state) => state.auth.user);
  const storedCartItems = useSelector((state) => state.cart.items);

  const {
    cartItems,
    replaceCart,
    totalQuantity,
    totalSum,
    isCartLoading,
    isCartAvailabilityChecking,
    isCartAvailabilityError,
    isCartAvailabilityConfirmed,
    isCheckoutDisabledByAvailability,
    cartAvailabilityMessage,
  } = useCartPageState({
    isAuthenticated: Boolean(user),
    storedCartItems,
  });

  const {
    cartActionDialog,
    handleCartItemQuantityChange,
    handleCartItemRemove,
    handleCartActionDialogClose,
  } = useCartItemActions({
    isAuthenticated: Boolean(user),
    cartItems,
    replaceCart,
  });

  const {
    checkoutDialog,
    isCheckoutLoading,
    handleCheckout,
    handleCheckoutDialogClose,
  } = useCartCheckout({
    isAuthenticated: Boolean(user),
    isCartAvailabilityConfirmed,
    cartItems,
    replaceCart,
  });

  return (
    <div className={styles.cartLayout}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Корзина</h1>
      </div>

      <div
        className={styles.itemsSection}
        aria-busy={isCartAvailabilityChecking}
      >
        {isCartLoading ? (
          <Loader label="Проверяем наличие товаров…" />
        ) : cartItems.length === 0 ? (
          <div className={styles.emptyMessage}>Корзина пуста</div>
        ) : (
          cartItems.map((cartItem) => (
            <CartItem
              key={cartItem.productId}
              cartItem={cartItem}
              onCartItemQuantityChange={handleCartItemQuantityChange}
              onCartItemRemove={handleCartItemRemove}
              areQuantityControlsDisabled={!isCartAvailabilityConfirmed}
            />
          ))
        )}

        {isCartAvailabilityChecking &&
          !isCartLoading &&
          cartItems.length > 0 && (
            <div
              className={styles.availabilityIndicator}
              role="status"
              aria-live="polite"
            >
              <Loader label="Проверяем наличие…" />
            </div>
          )}
      </div>

      <div className={styles.summarySection}>
        <CartSummary
          totalQuantity={totalQuantity}
          totalSum={totalSum}
          availabilityMessage={cartAvailabilityMessage}
          hideTotals={isCartLoading || isCartAvailabilityError}
          isCheckoutDisabled={isCheckoutDisabledByAvailability}
          onCheckout={handleCheckout}
          isCheckoutLoading={isCheckoutLoading}
        />

        {isCheckoutLoading && (
          <div className={styles.checkoutLoader}>
            <Loader label="Оформляем заказ…" />
          </div>
        )}

        <AlertDialog
          open={Boolean(checkoutDialog)}
          title={checkoutDialog?.title}
          description={checkoutDialog?.description}
          onClose={handleCheckoutDialogClose}
        />

        <AlertDialog
          open={Boolean(cartActionDialog)}
          title={cartActionDialog?.title}
          description={cartActionDialog?.description}
          onClose={handleCartActionDialogClose}
        />
      </div>
    </div>
  );
};
