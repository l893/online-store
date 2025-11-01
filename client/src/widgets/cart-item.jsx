import { Button } from '../shared/ui/button';
import { Input } from '../shared/ui/input';

export const CartItem = ({ item, onChangeQty, onRemove }) => {
  const onInput = (e) => {
    const v = Math.max(1, parseInt(e.target.value || '1', 10));
    onChangeQty(item.productId, v);
  };

  return (
    <div className="border rounded-xl p-4 bg-gray-50 flex items-center gap-4">
      <div className="w-28 h-28 bg-amber-50 rounded-lg border flex items-center justify-center">
        Фото
      </div>

      <div className="flex-1">
        <div className="font-medium">{item.title}</div>
        <div className="text-xs text-gray-500">id: {item.productId}</div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => onChangeQty(item.productId, item.qty - 1)}>
          -
        </Button>
        <Input
          className="w-16 text-center"
          value={item.qty}
          onChange={onInput}
        />
        <Button onClick={() => onChangeQty(item.productId, item.qty + 1)}>
          +
        </Button>
      </div>

      <div className="w-24 text-right font-semibold">
        {item.price * item.qty} ₽
      </div>

      <button
        aria-label="Remove"
        className="ml-2 rounded-full border p-2 text-amber-600 hover:bg-amber-50"
        onClick={() => onRemove(item.productId)}
      >
        ✕
      </button>
    </div>
  );
};
