import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../../../features/cart';
import {
  useConfirmCheckoutMutation,
  useCreateOrderMutation,
} from '../../../features/orders';

export function useCartCheckout({
  isAuthenticated,
  isCartAvailabilityConfirmed,
  cartItems = [],
  replaceCart,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const [checkoutDialog, setCheckoutDialog] = useState(null);

  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const [confirmCheckout, { isLoading: isConfirmingCheckout }] =
    useConfirmCheckoutMutation();

  const isCheckoutLoading =
    isCheckoutSubmitting || isCreatingOrder || isConfirmingCheckout;

  async function handleCheckout(event) {
    event?.currentTarget?.blur();

    if (!isCartAvailabilityConfirmed) {
      setCheckoutDialog({
        title: 'Наличие товаров не подтверждено',
        description: 'Дождитесь проверки наличия товаров и повторите попытку.',
      });
      return;
    }

    const unavailableCartItems = cartItems.filter(
      (cartItem) => cartItem.stock <= 0,
    );

    if (unavailableCartItems.length > 0) {
      const unavailableProductTitles = unavailableCartItems
        .map((cartItem) => cartItem.title)
        .join(', ');

      setCheckoutDialog({
        title: 'В корзине есть недоступные товары',
        description: `Удалите товары перед оформлением: ${unavailableProductTitles}`,
      });
      return;
    }

    const excessiveQuantityCartItems = cartItems.filter(
      (cartItem) => cartItem.stock > 0 && cartItem.qty > cartItem.stock,
    );

    if (excessiveQuantityCartItems.length > 0) {
      const excessiveQuantityProductTitles = excessiveQuantityCartItems
        .map((cartItem) => cartItem.title)
        .join(', ');

      setCheckoutDialog({
        title: 'Количество превышает остаток',
        description: `Уменьшите количество товаров: ${excessiveQuantityProductTitles}`,
      });
      return;
    }

    if (!isAuthenticated) {
      setCheckoutDialog({
        title: 'Войдите в аккаунт',
        description: 'Для оформления заказа войдите в аккаунт',
        shouldRedirectToLogin: true,
      });
      return;
    }

    setIsCheckoutSubmitting(true);

    try {
      await replaceCart(cartItems).unwrap();

      const { orderId } = await createOrder().unwrap();

      await confirmCheckout({ orderId }).unwrap();

      setCheckoutDialog({
        title: 'Оплата подтверждена',
        description: `Заказ: ${orderId}`,
      });

      dispatch(clearCart());
    } catch {
      setCheckoutDialog({
        title: 'Не удалось оформить заказ',
        description: 'Попробуйте повторить позже.',
      });
    } finally {
      setIsCheckoutSubmitting(false);
    }
  }

  function handleCheckoutDialogClose() {
    const shouldRedirectToLogin = checkoutDialog?.shouldRedirectToLogin;

    setCheckoutDialog(null);

    if (shouldRedirectToLogin) {
      navigate('/login', {
        state: {
          from: {
            pathname: '/cart',
          },
        },
      });
    }
  }

  return {
    checkoutDialog,
    isCheckoutLoading,
    handleCheckout,
    handleCheckoutDialogClose,
  };
}
