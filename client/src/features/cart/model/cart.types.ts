export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image?: string;
  stock: number;
  qty: number;
}

export type CartItemDraft = Omit<CartItem, 'qty'> & {
  qty?: number;
};

export interface CartState {
  items: CartItem[];
}

export interface CartTotals {
  readonly totalQuantity: number;
  readonly totalSum: number;
}
