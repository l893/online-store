import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clear } from '../../../features/cart';
import {
  useConfirmCheckoutMutation,
  useCreateOrderMutation,
} from '../../../features/orders';

export function useCartCheckout({
  isAuthenticated,
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

      dispatch(clear());
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
