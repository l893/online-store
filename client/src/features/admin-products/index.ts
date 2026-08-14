export {
  useAdminListProductsQuery,
  useAdminCreateProductMutation,
  useAdminUpdateProductMutation,
  useAdminDeleteProductMutation,
} from './api/products.api';
export type {
  AdminCreateProductResponse,
  AdminDeleteProductResponse,
  AdminProductPayload,
  AdminProductsListQuery,
  AdminProductsListResponse,
  AdminUpdateProductRequest,
  AdminUpdateProductResponse,
} from './api/products.types';

export type { AdminProduct } from './model/admin-product.types';
export type {
  ProductFormInitialValues,
  ProductFormSubmitHandler,
  ProductFormValues,
} from './model/product-form.types';

export { createProductFormInitialValues } from './lib/create-product-form-initial-values';
export { createProductPayload } from './lib/create-product-payload';

export { AdminProductFormPanel } from './ui/admin-product-form-panel';
export { AdminProductsPagination } from './ui/admin-products-pagination';
export { AdminProductsTable } from './ui/admin-products-table';
export { AdminProductsToolbar } from './ui/admin-products-toolbar';
