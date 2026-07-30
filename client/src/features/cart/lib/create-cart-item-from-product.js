export function createCartItemFromProduct(product) {
  return {
    productId: product._id,
    title: product.title,
    price: product.price,
    image: product.images?.[0],
    stock: Math.max(0, Number(product.stock) || 0),
  };
}
