import { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  changeQty,
  removeItem,
  clear,
  setAll,
  getInitialCartSyncDecision,
} from '../../features/cart';
import { useCartTotals } from '../../shared/hooks';
import { AlertDialog, Loader } from '../../shared/ui';
import { CartItem, CartSummary } from '../../widgets';
import {
  useGetCartQuery,
  useReplaceCartMutation,
  useRemoveItemFromCartMutation,
} from '../../features/cart';
import {
  useCreateOrderMutation,
  useConfirmCheckoutMutation,
} from '../../features/orders';
import { useNavigate } from 'react-router-dom';
import styles from './cart-page.module.scss';

export const CartPage = () => {
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const [checkoutDialog, setCheckoutDialog] = useState(null);

  // если авторизован — подтянем серверную корзину
  const { data: serverCart, isLoading: loadingServerCart } = useGetCartQuery(
    undefined,
    { skip: !user },
  );

  // хук для замены корзины на сервере
  const [replaceCart] = useReplaceCartMutation();
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const [confirmCheckout, { isLoading: confirmingCheckout }] =
    useConfirmCheckoutMutation();
  const [removeItemFromCart] = useRemoveItemFromCartMutation(); // Хук для удаления

  const isCheckoutLoading =
    isCheckoutSubmitting || creatingOrder || confirmingCheckout;

  const { totalQty, totalSum } = useCartTotals(items);

  // начальная синхронизация: выбираем, что считать "истиной"
  useEffect(() => {
    if (!user || !serverCart || isInitialSyncDone) return;

    const serverItems = Array.isArray(serverCart.items) ? serverCart.items : [];
    const { shouldPushLocalItemsToServer, shouldReplaceLocalItemsWithServer } =
      getInitialCartSyncDecision({
        localItems: items,
        serverItems,
      });

    // Случай 1: гость добавлял товары, затем залогинился,
    // а на сервере корзина пустая → пушим локальные товары на сервер
    if (shouldPushLocalItemsToServer) {
      replaceCart(items).catch(() => {});
      return;
    }

    // Случай 2: локально пусто, а на сервере есть корзина → подтягиваем её в Redux
    if (shouldReplaceLocalItemsWithServer) {
      dispatch(setAll(serverItems));
    }

    setIsInitialSyncDone(true);
  }, [user, serverCart, items, dispatch, replaceCart, isInitialSyncDone]);

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

  const handleCheckoutDialogClose = () => {
    const shouldRedirectToLogin = checkoutDialog?.shouldRedirectToLogin;

    setCheckoutDialog(null);

    if (shouldRedirectToLogin) {
      nav('/login', { state: { from: { pathname: '/cart' } } });
    }
  };

  const onCheckout = useCallback(
    async (event) => {
      event?.currentTarget?.blur();

      if (!user) {
        setCheckoutDialog({
          title: 'Войдите в аккаунт',
          description: 'Для оформления заказа войдите в аккаунт',
          shouldRedirectToLogin: true,
        });
        return;
      }

      setIsCheckoutSubmitting(true);

      try {
        // синхронизируем корзину на сервере (полная замена)
        await replaceCart(items).unwrap();

        // создаём заказ из серверной корзины
        const { orderId } = await createOrder().unwrap();

        // подтверждаем оплату (мок)
        await confirmCheckout({ orderId }).unwrap();

        setCheckoutDialog({
          title: 'Оплата подтверждена',
          description: `Заказ: ${orderId}`,
        });

        dispatch(clear());
      } catch {
        setCheckoutDialog({
          title: 'Не удалось оформить заказ',
          description: 'Попробуйте повторить позже.',
        });
      } finally {
        setIsCheckoutSubmitting(false);
      }
    },
    [user, replaceCart, items, createOrder, confirmCheckout, dispatch],
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
          onCheckout={onCheckout}
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
