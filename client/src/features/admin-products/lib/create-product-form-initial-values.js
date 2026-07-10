export function createProductFormInitialValues(product) {
  if (!product) {
    return null;
  }

  return {
    ...product,
    image: product.images?.[0] || '',
  };
}
