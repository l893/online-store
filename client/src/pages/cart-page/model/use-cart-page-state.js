import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetProductsAvailabilityQuery } from '@entities/products';
import {
  applyProductDetailsToCartItems,
  getCartTotals,
  setCartItems,
  useGetCartQuery,
  useInitialCartSync,
  useReplaceCartMutation,
} from '@features/cart';

function getCartAvailabilityMessage({
  isCartAvailabilityChecking,
  isCartAvailabilityError,
  unavailableCartItems,
  excessiveQuantityCartItems,
}) {
  if (isCartAvailabilityChecking) {
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
  const dispatch = useDispatch();
  const productIds = storedCartItems.map((cartItem) => cartItem.productId);

  const { data: serverCart, isLoading: isServerCartLoading } = useGetCartQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );

  const {
    currentData: productsAvailability,
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

  const cartItems = productsAvailability?.items
    ? applyProductDetailsToCartItems(
        storedCartItems,
        productsAvailability.items,
      )
    : storedCartItems;

  const haveStoredProductDetailsChanged =
    Boolean(productsAvailability?.items) &&
    cartItems.some((cartItem, cartItemIndex) => {
      const storedCartItem = storedCartItems[cartItemIndex];

      return (
        !storedCartItem ||
        storedCartItem.title !== cartItem.title ||
        storedCartItem.price !== cartItem.price ||
        storedCartItem.image !== cartItem.image ||
        storedCartItem.stock !== cartItem.stock
      );
    });

  useEffect(() => {
    if (!haveStoredProductDetailsChanged) {
      return;
    }

    dispatch(setCartItems(cartItems));
  }, [cartItems, dispatch, haveStoredProductDetailsChanged]);

  const serverCartItems = Array.isArray(serverCart?.items)
    ? serverCart.items
    : [];

  const isInitialServerCartHydrationPending =
    isAuthenticated &&
    !isServerCartLoading &&
    storedCartItems.length === 0 &&
    serverCartItems.length > 0;

  const isCartLoading =
    isAuthenticated &&
    (isServerCartLoading || isInitialServerCartHydrationPending);

  const isCartAvailabilityChecking =
    productIds.length > 0 &&
    (isProductsAvailabilityLoading || isProductsAvailabilityFetching);

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
    !isCartLoading &&
    !isCartAvailabilityChecking &&
    !isCartAvailabilityError &&
    (productIds.length === 0 || Boolean(productsAvailability?.items));
  const isCheckoutDisabledByAvailability =
    !isCartAvailabilityConfirmed || hasCartAvailabilityIssues;
  const cartAvailabilityMessage = getCartAvailabilityMessage({
    isCartAvailabilityChecking,
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
    isCartAvailabilityChecking,
    isCartAvailabilityError,
    isCartAvailabilityConfirmed,
    isCheckoutDisabledByAvailability,
    cartAvailabilityMessage,
  };
}
