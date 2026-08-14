import type { Product } from '@entities/products';

import type { AdminProduct } from '../model/admin-product.types';

export interface AdminProductsListQuery {
  readonly search?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface AdminProductsListResponse {
  readonly items: readonly AdminProduct[];
  readonly total: number;
  readonly page: number;
  readonly pages: number;
}

export interface AdminProductPayload {
  readonly title: string;
  readonly slug: string;
  readonly description?: string | null;
  readonly price: number;
  readonly images: readonly string[];
  readonly categoryId?: string | null;
  readonly stock: number;
}

export interface AdminUpdateProductRequest extends AdminProductPayload {
  readonly id: string;
}

export interface AdminDeleteProductResponse {
  readonly ok: true;
}

export type AdminCreateProductResponse = Product;
export type AdminUpdateProductResponse = Product;
