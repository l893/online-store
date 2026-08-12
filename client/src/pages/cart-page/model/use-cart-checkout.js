import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart, setCartItems } from '@features/cart';
import {
  useConfirmCheckoutMutation,
  useCreateOrderMutation,
} from '@features/orders';
import { api } from '@shared/lib';

function getStockConflictItems(error, cartItems) {
  const errorCode = error?.data?.code;

  if (errorCode === 'ORDER_STOCK_CONFLICT') {
    return Array.isArray(error.data.items) ? error.data.items : [];
  }

  if (errorCode !== 'INSUFFICIENT_STOCK') {
    return [];
  }

  const matchingCartItem = cartItems.find(
    (cartItem) => cartItem.productId === error.data.productId,
  );

  return [
    {
      productId: error.data.productId,
      title: matchingCartItem?.title || 'Неизвестный товар',
      requestedQuantity: error.data.requestedQuantity,
      availableStock: error.data.availableStock,
    },
  ];
}

function applyStockConflictsToCartItems(cartItems, stockConflictItems) {
  const productStockById = new Map(
    stockConflictItems.map((stockConflictItem) => [
      stockConflictItem.productId,
      Math.max(0, Number(stockConflictItem.availableStock) || 0),
    ]),
  );

  return cartItems.map((cartItem) => {
    if (!productStockById.has(cartItem.productId)) {
      return cartItem;
    }

    return {
      ...cartItem,
      stock: productStockById.get(cartItem.productId),
    };
  });
}

function createStockConflictDescription(stockConflictItems) {
  const stockConflictMessages = stockConflictItems.map((stockConflictItem) => {
    const title = stockConflictItem.title || 'Неизвестный товар';
    const requestedQuantity = Math.max(
      1,
      Number(stockConflictItem.requestedQuantity) || 1,
    );
    const availableStock = Math.max(
      0,
      Number(stockConflictItem.availableStock) || 0,
    );

    return `«${title}»: в корзине ${requestedQuantity}, доступно ${availableStock}`;
  });

  return `${stockConflictMessages.join(
    '; ',
  )}. Проверьте корзину и повторите оформление.`;
}

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

      dispatch(
        api.util.updateQueryData('getCart', undefined, (cachedCartResponse) => {
          cachedCartResponse.items = [];
        }),
      );

      dispatch(clearCart());
      dispatch(api.util.invalidateTags(['Product']));

      setCheckoutDialog({
        title: 'Оплата подтверждена',
        description: `Заказ: ${orderId}`,
      });
    } catch (error) {
      const stockConflictItems = getStockConflictItems(error, cartItems);

      if (stockConflictItems.length > 0) {
        dispatch(
          setCartItems(
            applyStockConflictsToCartItems(cartItems, stockConflictItems),
          ),
        );

        dispatch(api.util.invalidateTags(['Product']));

        setCheckoutDialog({
          title: 'Остаток товаров изменился',
          description: createStockConflictDescription(stockConflictItems),
        });

        return;
      }

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
