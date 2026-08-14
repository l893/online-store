import type { Product } from '@entities/products';

export interface AdminProduct extends Product {
  readonly categoryName: string;
}
