function normalizeAvailableStock(stock) {
  return Math.max(0, Math.floor(Number(stock) || 0));
}

export function applyProductDetailsToCartItems(
  cartItems,
  productDetailsItems = [],
) {
  const productDetailsById = new Map(
    productDetailsItems.map((productDetailsItem) => [
      productDetailsItem.productId,
      productDetailsItem,
    ]),
  );

  return cartItems.map((cartItem) => {
    const productDetails = productDetailsById.get(cartItem.productId);

    if (!productDetails) {
      return {
        ...cartItem,
        stock: 0,
      };
    }

    const normalizedPrice = Number(productDetails.price);

    return {
      ...cartItem,
      title:
        typeof productDetails.title === 'string'
          ? productDetails.title
          : cartItem.title,
      price: Number.isFinite(normalizedPrice)
        ? normalizedPrice
        : cartItem.price,
      image:
        typeof productDetails.image === 'string'
          ? productDetails.image
          : cartItem.image,
      stock: normalizeAvailableStock(productDetails.stock),
    };
  });
}
