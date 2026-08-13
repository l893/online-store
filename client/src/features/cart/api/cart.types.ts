import type { CartItem } from '../model/cart.types';

export interface CartResponse {
  readonly userId: string;
  items: CartItem[];
}
