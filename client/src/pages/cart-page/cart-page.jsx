import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeQty, removeItem, useInitialCartSync } from '../../features/cart';
import { useCartTotals } from '../../shared/hooks';
import { AlertDialog, Loader } from '../../shared/ui';
import { CartItem, CartSummary } from '../../widgets';
import {
  useGetCartQuery,
  useReplaceCartMutation,
  useRemoveItemFromCartMutation,
} from '../../features/cart';
import { useCartCheckout } from './model/use-cart-checkout';
import styles from './cart-page.module.scss';

export const CartPage = () => {
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  // если авторизован — подтянем серверную корзину
  const { data: serverCart, isLoading: loadingServerCart } = useGetCartQuery(
    undefined,
    { skip: !user },
  );

  // хук для замены корзины на сервере
  const [replaceCart] = useReplaceCartMutation();
  const [removeItemFromCart] = useRemoveItemFromCartMutation(); // Хук для удаления

  useInitialCartSync({
    isAuthenticated: Boolean(user),
    localItems: items,
    serverCart,
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

  const { totalQty, totalSum } = useCartTotals(items);

  const onChangeQty = useCallback(
    (productId, qty) => {
      dispatch(changeQty({ productId, qty }));

      if (user) {
        const nextItems = items.map((item) =>
          item.productId === productId ? { ...item, qty } : item,
        );
        replaceCart(nextItems).catch(() => {});
      }
    },
    [dispatch, user, items, replaceCart],
  );

  const onRemove = useCallback(
    (productId) => {
      dispatch(removeItem(productId)); // Убираем товар из локальной корзины

      if (user) {
        // Если авторизован, отправляем запрос на сервер
        removeItemFromCart(productId).catch(() => {});
      }
    },
    [dispatch, user, removeItemFromCart],
  );

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
              onChangeQty={onChangeQty}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      <div className={styles.summarySection}>
        <CartSummary
          totalQty={totalQty}
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
