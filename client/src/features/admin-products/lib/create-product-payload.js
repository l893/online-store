export function createProductPayload(values) {
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
