export function createProductFormInitialValues(product) {
  if (!product) {
    return {
      title: '',
      slug: '',
      description: '',
      price: '',
      categoryId: '',
      stock: '',
      image: '',
    };
  }

  return {
    title: product.title || '',
    slug: product.slug || '',
    description: product.description || '',
    price: product.price ?? '',
    categoryId: product.categoryId ? String(product.categoryId) : '',
    stock: product.stock ?? '',
    image: product.images?.[0] || '',
  };
}
