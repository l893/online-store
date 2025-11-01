import { useSelector, useDispatch } from 'react-redux';
import { changeQty, removeItem, clear } from '../features/cart';
import { useCartTotals } from '../shared/hooks';
import { CartItem, CartSummary } from '../widgets';

export const CartPage = () => {
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const { totalQty, totalSum } = useCartTotals(items);

  const onChangeQty = (productId, qty) =>
    dispatch(changeQty({ productId, qty }));
  const onRemove = (productId) => dispatch(removeItem(productId));

  const onCheckout = () => {
    // Пока мок: просто очистим корзину и покажем alert.
    alert(`Оформление заказа (мок): сумма ${totalSum} ₽`);
    dispatch(clear());
  };

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
