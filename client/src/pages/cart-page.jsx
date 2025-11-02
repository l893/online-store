import { useSelector, useDispatch } from 'react-redux';
import { changeQty, removeItem, clear, setAll } from '../features/cart';
import { useCartTotals } from '../shared/hooks';
import { CartItem, CartSummary } from '../widgets';
import { useEffect, useCallback } from 'react';
import { useGetCartQuery, useReplaceCartMutation } from '../features/cart';
import {
  useCreateOrderMutation,
  useConfirmCheckoutMutation,
} from '../features/orders';
import { useNavigate } from 'react-router-dom';

export const CartPage = () => {
  const user = useSelector((s) => s.auth.user);
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const nav = useNavigate();

  // если авторизован — подтянем серверную корзину
  const { data: serverCart } = useGetCartQuery(undefined, { skip: !user });
  useEffect(() => {
    if (user && serverCart?.items) {
      dispatch(setAll(serverCart.items));
    }
  }, [user, serverCart, dispatch]);

  const [replaceCart] = useReplaceCartMutation();
  const [createOrder] = useCreateOrderMutation();
  const [confirmCheckout] = useConfirmCheckoutMutation();

  const { totalQty, totalSum } = useCartTotals(items);

  const onChangeQty = useCallback(
    (productId, qty) => {
      dispatch(changeQty({ productId, qty }));
    },
    [dispatch],
  );

  const onRemove = useCallback(
    (productId) => {
      dispatch(removeItem(productId));
    },
    [dispatch],
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
      </div>
    </div>
  );
};
