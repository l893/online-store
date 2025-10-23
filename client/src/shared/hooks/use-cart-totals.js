import { useMemo } from 'react';

export function useCartTotals(items) {
  return useMemo(() => {
    const totalQty = items.reduce((s, i) => s + i.qty, 0);
    const totalSum = items.reduce((s, i) => s + i.qty * i.price, 0);
    return { totalQty, totalSum };
  }, [items]);
}
