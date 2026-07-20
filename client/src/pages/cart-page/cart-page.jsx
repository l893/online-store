import { useSelector } from 'react-redux';
import {
  getCartTotals,
  useCartItemActions,
  useGetCartQuery,
  useInitialCartSync,
  useReplaceCartMutation,
} from '../../features/cart';
import { AlertDialog, Loader } from '../../shared/ui';
import { CartItem } from '../../widgets';
import { CartSummary } from '../../widgets/cart-summary';
import { useCartCheckout } from './model/use-cart-checkout';
import styles from './cart-page.module.scss';

export const CartPage = () => {
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);

  // если авторизован — подтянем серверную корзину
  const { data: serverCart, isLoading: loadingServerCart } = useGetCartQuery(
    undefined,
    { skip: !user },
  );

  // хук для замены корзины на сервере
  const [replaceCart] = useReplaceCartMutation();

  useInitialCartSync({
    isAuthenticated: Boolean(user),
    localItems: items,
    serverCart,
    replaceCart,
  });

  const { handleCartItemQuantityChange, handleCartItemRemove } =
    useCartItemActions({
      isAuthenticated: Boolean(user),
      cartItems: items,
      replaceCart,
    });

  const {
    checkoutDialog,
    isCheckoutLoading,
    handleCheckout,
    handleCheckoutDialogClose,
  } = useCartCheckout({
    isAuthenticated: Boolean(user),
    cartItems: items,
    replaceCart,
  });

  const { totalQuantity, totalSum } = getCartTotals(items);

  return (
    <div className={styles.cartLayout}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Корзина</h1>
      </div>

      <div className={styles.itemsSection}>
        {loadingServerCart && user && (
          <Loader label="Синхронизируем корзину…" />
        )}
        {items.length === 0 ? (
          <div className={styles.emptyMessage}>Корзина пуста</div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onChangeQty={handleCartItemQuantityChange}
              onRemove={handleCartItemRemove}
            />
          ))
        )}
      </div>

      <div className={styles.summarySection}>
        <CartSummary
          totalQuantity={totalQuantity}
          totalSum={totalSum}
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
      </div>
    </div>
  );
};
