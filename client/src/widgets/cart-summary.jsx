import { Button } from '../shared/ui/button';

export const CartSummary = ({ totalQty, totalSum, onCheckout }) => {
  return (
    <aside className="border rounded-xl p-4 bg-gray-50 min-w-[260px]">
      <div className="text-lg font-semibold mb-2">Итого</div>
      <div className="text-sm text-gray-600 mb-4">Товаров: {totalQty}</div>
      <div className="text-xl font-bold mb-4">{totalSum} ₽</div>
      <Button className="w-full" onClick={onCheckout}>
        Оформить заказ
      </Button>
    </aside>
  );
};
