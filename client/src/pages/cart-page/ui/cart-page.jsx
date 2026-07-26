import { useSelector } from 'react-redux';
import { useGetProductsAvailabilityQuery } from '../../../entities/products';
import {
  getCartTotals,
  useCartItemActions,
  useGetCartQuery,
  useInitialCartSync,
  useReplaceCartMutation,
} from '../../../features/cart';
import { AlertDialog, Loader } from '../../../shared/ui';
import { CartItem } from '../../../widgets/cart-item';
import { CartSummary } from '../../../widgets/cart-summary';
import { useCartCheckout } from '../model/use-cart-checkout';
import styles from './cart-page.module.scss';

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
  isLoading,
  isError,
  unavailableCartItems,
  excessiveQuantityCartItems,
}) {
  if (isLoading) {
    return 'Проверяем наличие товаров…';
  }

  if (isError) {
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

export const CartPage = () => {
  const user = useSelector((state) => state.auth.user);
  const storedCartItems = useSelector((state) => state.cart.items);

  const productIds = storedCartItems.map((cartItem) => cartItem.productId);

  // если авторизован — подтянем серверную корзину
  const { data: serverCart, isLoading: loadingServerCart } = useGetCartQuery(
    undefined,
    { skip: !user },
  );

  const {
    data: productsAvailability,
    isLoading: isProductsAvailabilityLoading,
    isFetching: isProductsAvailabilityFetching,
    isError: isProductsAvailabilityError,
  } = useGetProductsAvailabilityQuery(productIds, {
    skip: productIds.length === 0,
    refetchOnMountOrArgChange: true,
  });

  const cartItems = applyProductAvailability(
    storedCartItems,
    productsAvailability?.items,
  );

  const isCartLoading =
    (Boolean(user) && loadingServerCart) ||
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
  const isCartAvailabilityConfirmed =
    !isCartLoading && !isProductsAvailabilityError;
  const isCheckoutDisabledByAvailability =
    !isCartAvailabilityConfirmed || hasCartAvailabilityIssues;
  const cartAvailabilityMessage = getCartAvailabilityMessage({
    isLoading: isCartLoading,
    isError: isProductsAvailabilityError,
    unavailableCartItems,
    excessiveQuantityCartItems,
  });

  // хук для замены корзины на сервере
  const [replaceCart] = useReplaceCartMutation();

  useInitialCartSync({
    isAuthenticated: Boolean(user),
    localItems: storedCartItems,
    serverCart,
    replaceCart,
  });

  const {
    cartActionDialog,
    handleCartItemQuantityChange,
    handleCartItemRemove,
    handleCartActionDialogClose,
  } = useCartItemActions({
    isAuthenticated: Boolean(user),
    cartItems,
    replaceCart,
  });

  const {
    checkoutDialog,
    isCheckoutLoading,
    handleCheckout,
    handleCheckoutDialogClose,
  } = useCartCheckout({
    isAuthenticated: Boolean(user),
    isCartAvailabilityConfirmed,
    cartItems,
    replaceCart,
  });

  const { totalQuantity, totalSum } = getCartTotals(cartItems);

  return (
    <div className={styles.cartLayout}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Корзина</h1>
      </div>

      <div className={styles.itemsSection}>
        {isCartLoading ? (
          <Loader label="Проверяем наличие товаров…" />
        ) : isProductsAvailabilityError ? (
          <div className={styles.emptyMessage}>
            Не удалось проверить наличие товаров
          </div>
        ) : cartItems.length === 0 ? (
          <div className={styles.emptyMessage}>Корзина пуста</div>
        ) : (
          cartItems.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onChangeQty={handleCartItemQuantityChange}
              onRemove={handleCartItemRemove}
            />
          ))
        )}
      </div>

      <div className={styles.summarySection}>
        <CartSummary
          totalQuantity={totalQuantity}
          totalSum={totalSum}
          availabilityMessage={cartAvailabilityMessage}
          hideTotals={isCartLoading || isProductsAvailabilityError}
          isCheckoutDisabled={isCheckoutDisabledByAvailability}
          onCheckout={handleCheckout}
          isCheckoutLoading={isCheckoutLoading}
        />

        {isCheckoutLoading && (
          <div className={styles.checkoutLoader}>
            <Loader label="Оформляем заказ…" />
          </div>
        )}

        <AlertDialog
          open={Boolean(checkoutDialog)}
          title={checkoutDialog?.title}
          description={checkoutDialog?.description}
          onClose={handleCheckoutDialogClose}
        />

        <AlertDialog
          open={Boolean(cartActionDialog)}
          title={cartActionDialog?.title}
          description={cartActionDialog?.description}
          onClose={handleCartActionDialogClose}
        />
      </div>
    </div>
  );
};
