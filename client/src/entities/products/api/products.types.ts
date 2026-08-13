import type { Product } from '../model/product.types';

export type ProductSortValue = 'price_asc' | 'price_desc';

export interface ProductListQueryParameters {
  readonly search?: string;
  readonly category?: string;
  readonly sort?: ProductSortValue;
  readonly page?: number;
  readonly limit?: number;
}

export interface ProductListResponse {
  readonly items: readonly Product[];
  readonly total: number;
  readonly page: number;
  readonly pages: number;
}

export interface ProductAvailabilityItem {
  readonly productId: string;
  readonly title?: string;
  readonly price?: number;
  readonly image?: string;
  readonly stock: number;
}

export interface ProductAvailabilityResponse {
  readonly items: readonly ProductAvailabilityItem[];
}
