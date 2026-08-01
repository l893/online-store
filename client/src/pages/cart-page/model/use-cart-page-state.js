import { useGetProductsAvailabilityQuery } from '../../../entities/products';
import {
  getCartTotals,
  useGetCartQuery,
  useInitialCartSync,
  useReplaceCartMutation,
} from '../../../features/cart';

function applyProductAvailability(cartItems, productAvailabilityItems = []) {
  const productStockById = new Map(
    productAvailabilityItems.map((productAvailabilityItem) => [
      productAvailabilityItem.productId,
      productAvailabilityItem.stock,
    ]),
  );

  return cartItems.map((cartItem) => ({
    ...cartItem,
    stock: productStockById.get(cartItem.productId) ?? 0,
  }));
}

function getCartAvailabilityMessage({
  isCartLoading,
  isCartAvailabilityError,
  unavailableCartItems,
  excessiveQuantityCartItems,
}) {
  if (isCartLoading) {
    return 'Проверяем наличие товаров…';
  }

  if (isCartAvailabilityError) {
    return 'Не удалось проверить наличие товаров';
  }

  if (
    unavailableCartItems.length > 0 &&
    excessiveQuantityCartItems.length > 0
  ) {
    return 'Удалите закончившиеся товары и уменьшите количество остальных до доступного остатка.';
  }

  if (unavailableCartItems.length > 0) {
    const unavailableProductTitles = unavailableCartItems
      .map((cartItem) => cartItem.title)
      .join(', ');

    return `Удалите недоступные товары: ${unavailableProductTitles}`;
  }

  if (excessiveQuantityCartItems.length > 0) {
    const excessiveQuantityProductTitles = excessiveQuantityCartItems
      .map((cartItem) => cartItem.title)
      .join(', ');

    return `Уменьшите количество товаров до доступного остатка: ${excessiveQuantityProductTitles}`;
  }

  return '';
}

export function useCartPageState({ isAuthenticated, storedCartItems = [] }) {
  const productIds = storedCartItems.map((cartItem) => cartItem.productId);

  const { data: serverCart, isLoading: isServerCartLoading } = useGetCartQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );

  const {
    data: productsAvailability,
    isLoading: isProductsAvailabilityLoading,
    isFetching: isProductsAvailabilityFetching,
    isError: isProductsAvailabilityError,
  } = useGetProductsAvailabilityQuery(productIds, {
    skip: productIds.length === 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [replaceCart] = useReplaceCartMutation();

  useInitialCartSync({
    isAuthenticated,
    localCartItems: storedCartItems,
    serverCart,
    replaceCart,
  });

  const cartItems = applyProductAvailability(
    storedCartItems,
    productsAvailability?.items,
  );

  const isCartLoading =
    (isAuthenticated && isServerCartLoading) ||
    isProductsAvailabilityLoading ||
    isProductsAvailabilityFetching;

  const unavailableCartItems = cartItems.filter(
    (cartItem) => cartItem.stock <= 0,
  );
  const excessiveQuantityCartItems = cartItems.filter(
    (cartItem) => cartItem.stock > 0 && cartItem.qty > cartItem.stock,
  );

  const hasCartAvailabilityIssues =
    unavailableCartItems.length > 0 || excessiveQuantityCartItems.length > 0;
  const isCartAvailabilityError = isProductsAvailabilityError;
  const isCartAvailabilityConfirmed =
    !isCartLoading && !isCartAvailabilityError;
  const isCheckoutDisabledByAvailability =
    !isCartAvailabilityConfirmed || hasCartAvailabilityIssues;
  const cartAvailabilityMessage = getCartAvailabilityMessage({
    isCartLoading,
    isCartAvailabilityError,
    unavailableCartItems,
    excessiveQuantityCartItems,
  });
  const { totalQuantity, totalSum } = getCartTotals(cartItems);

  return {
    cartItems,
    replaceCart,
    totalQuantity,
    totalSum,
    isCartLoading,
    isCartAvailabilityError,
    isCartAvailabilityConfirmed,
    isCheckoutDisabledByAvailability,
    cartAvailabilityMessage,
  };
}
