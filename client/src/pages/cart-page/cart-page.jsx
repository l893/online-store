import { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeQty, removeItem, clear, setAll } from '../../features/cart';
import { useCartTotals } from '../../shared/hooks';
import { Loader } from '../../shared/ui';
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

export const CartPage = () => {
  const user = useSelector((s) => s.auth.user);
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  // если авторизован — подтянем серверную корзину
  const { data: serverCart, isLoading: loadingServerCart } = useGetCartQuery(
    undefined,
    { skip: !user },
  );

  // хук для замены корзины на сервере
  const [replaceCart, { isLoading: replacingCart }] = useReplaceCartMutation();
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const [confirmCheckout, { isLoading: confirmingCheckout }] =
    useConfirmCheckoutMutation();
  const [removeItemFromCart] = useRemoveItemFromCartMutation(); // Хук для удаления

  const isCheckoutLoading =
    replacingCart || creatingOrder || confirmingCheckout;

  const { totalQty, totalSum } = useCartTotals(items);

  // начальная синхронизация: выбираем, что считать "истиной"
  useEffect(() => {
    if (!user || !serverCart || isInitialSyncDone) return;

    const serverItems = Array.isArray(serverCart.items) ? serverCart.items : [];
    const hasServerItems = serverItems.length > 0;
    const hasLocalItems = items.length > 0;

    // Случай 1: гость добавлял товары, затем залогинился,
    // а на сервере корзина пустая → пушим локальные товары на сервер
    if (hasLocalItems && !hasServerItems) {
      replaceCart(items).catch(() => {});
      return;
    } else if (!hasLocalItems && hasServerItems) {
      // Случай 2: локально пусто, а на сервере есть корзина → подтягиваем её в Redux
      dispatch(setAll(serverItems));
    }

    setIsInitialSyncDone(true);
  }, [user, serverCart, items, dispatch, replaceCart, isInitialSyncDone]);

  const onChangeQty = useCallback(
    (productId, qty) => {
      dispatch(changeQty({ productId, qty }));

      if (user) {
        const nextItems = items.map((it) =>
          it.productId === productId ? { ...it, qty } : it,
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

  const onCheckout = useCallback(async () => {
    if (!user) {
      alert('Для оформления заказа войдите в аккаунт');
      nav('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    try {
      // синхронизируем корзину на сервере (полная замена)
      await replaceCart(items).unwrap();

      // создаём заказ из серверной корзины
      const { orderId } = await createOrder().unwrap();

      // подтверждаем оплату (мок)
      await confirmCheckout({ orderId }).unwrap();

      alert(`Оплата подтверждена (мок). Заказ: ${orderId}`);
      dispatch(clear());
    } catch (e) {
      console.error('Checkout error:', e);
      alert('Не удалось оформить заказ');
    }
  }, [user, nav, replaceCart, items, createOrder, confirmCheckout, dispatch]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <h1 className="text-2xl font-semibold mb-2">Корзина</h1>
      </div>

      <div className="col-span-12 lg:col-span-8 space-y-4">
        {loadingServerCart && user && (
          <Loader label="Синхронизируем корзину…" />
        )}
        {items.length === 0 ? (
          <div className="text-gray-500">Корзина пуста</div>
        ) : (
          items.map((it) => (
            <CartItem
              key={it.productId}
              item={it}
              onChangeQty={onChangeQty}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      <div className="col-span-12 lg:col-span-4">
        <CartSummary
          totalQty={totalQty}
          totalSum={totalSum}
          onCheckout={onCheckout}
        />
        {isCheckoutLoading && (
          <div className="mt-3">
            <Loader label="Оформляем заказ…" />
          </div>
        )}
      </div>
    </div>
  );
};
