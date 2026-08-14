import type { AdminProductPayload } from '../api/products.types';
import type { ProductFormValues } from '../model/product-form.types';

export function createProductPayload(
  values: ProductFormValues,
): AdminProductPayload {
  return {
    title: values.title,
    slug: values.slug,
    description: values.description,
    price: values.price,
    images: values.image ? [values.image] : [],
    categoryId: values.categoryId,
    stock: values.stock,
  };
}
