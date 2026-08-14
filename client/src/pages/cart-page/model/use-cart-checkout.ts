import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { cartApi, clearCart, setCartItems } from '@features/cart';
import type {
  CartItem,
  CartOrchestrationDispatch,
  ReplaceCartTrigger,
} from '@features/cart';
import {
  useConfirmCheckoutMutation,
  useCreateOrderMutation,
} from '@features/orders';

interface CheckoutDialog {
  readonly title: string;
  readonly description: string;
  readonly shouldRedirectToLogin?: boolean;
}

interface StockConflictItem {
  readonly productId: string;
  readonly title: string;
  readonly requestedQuantity: number;
  readonly availableStock: number;
}

interface UseCartCheckoutOptions {
  readonly isAuthenticated: boolean;
  readonly isCartAvailabilityConfirmed: boolean;
  readonly cartItems?: readonly CartItem[];
  readonly replaceCart: ReplaceCartTrigger;
}

interface UseCartCheckoutResult {
  readonly checkoutDialog: CheckoutDialog | null;
  readonly isCheckoutLoading: boolean;
  readonly handleCheckout: (
    event?: MouseEvent<HTMLButtonElement>,
  ) => Promise<void>;
  readonly handleCheckoutDialogClose: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeStockConflictItem(value: unknown): StockConflictItem | null {
  if (
    !isRecord(value) ||
    typeof value.productId !== 'string' ||
    !value.productId
  ) {
    return null;
  }

  return {
    productId: value.productId,
    title:
      typeof value.title === 'string' && value.title
        ? value.title
        : 'Неизвестный товар',
    requestedQuantity: Math.max(1, Number(value.requestedQuantity) || 1),
    availableStock: Math.max(0, Number(value.availableStock) || 0),
  };
}

function getStockConflictItems(
  error: unknown,
  cartItems: readonly CartItem[],
): StockConflictItem[] {
  if (!isRecord(error) || !isRecord(error.data)) {
    return [];
  }

  const errorData = error.data;
  const errorCode = errorData.code;

  if (errorCode === 'ORDER_STOCK_CONFLICT') {
    if (!Array.isArray(errorData.items)) {
      return [];
    }

    return errorData.items
      .map((stockConflictItem: unknown) =>
        normalizeStockConflictItem(stockConflictItem),
      )
      .filter(
        (stockConflictItem): stockConflictItem is StockConflictItem =>
          stockConflictItem !== null,
      );
  }

  if (
    errorCode !== 'INSUFFICIENT_STOCK' ||
    typeof errorData.productId !== 'string'
  ) {
    return [];
  }

  const matchingCartItem = cartItems.find(
    (cartItem) => cartItem.productId === errorData.productId,
  );

  return [
    {
      productId: errorData.productId,
      title: matchingCartItem?.title || 'Неизвестный товар',
      requestedQuantity: Math.max(1, Number(errorData.requestedQuantity) || 1),
      availableStock: Math.max(0, Number(errorData.availableStock) || 0),
    },
  ];
}

function applyStockConflictsToCartItems(
  cartItems: readonly CartItem[],
  stockConflictItems: readonly StockConflictItem[],
): CartItem[] {
  const productStockById = new Map<string, number>(
    stockConflictItems.map((stockConflictItem) => [
      stockConflictItem.productId,
      stockConflictItem.availableStock,
    ]),
  );

  return cartItems.map((cartItem) => {
    const availableStock = productStockById.get(cartItem.productId);

    if (availableStock === undefined) {
      return cartItem;
    }

    return {
      ...cartItem,
      stock: availableStock,
    };
  });
}

function createStockConflictDescription(
  stockConflictItems: readonly StockConflictItem[],
): string {
  const stockConflictMessages = stockConflictItems.map((stockConflictItem) => {
    const title = stockConflictItem.title || 'Неизвестный товар';

    return `«${title}»: в корзине ${stockConflictItem.requestedQuantity}, доступно ${stockConflictItem.availableStock}`;
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
}: UseCartCheckoutOptions): UseCartCheckoutResult {
  const dispatch = useDispatch<CartOrchestrationDispatch>();
  const navigate = useNavigate();

  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const [checkoutDialog, setCheckoutDialog] = useState<CheckoutDialog | null>(
    null,
  );

  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const [confirmCheckout, { isLoading: isConfirmingCheckout }] =
    useConfirmCheckoutMutation();

  const isCheckoutLoading =
    isCheckoutSubmitting || isCreatingOrder || isConfirmingCheckout;

  async function handleCheckout(
    event?: MouseEvent<HTMLButtonElement>,
  ): Promise<void> {
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
        cartApi.util.updateQueryData(
          'getCart',
          undefined,
          (cachedCartResponse) => {
            cachedCartResponse.items = [];
          },
        ),
      );

      dispatch(clearCart());
      dispatch(cartApi.util.invalidateTags(['Product']));

      setCheckoutDialog({
        title: 'Оплата подтверждена',
        description: `Заказ: ${orderId}`,
      });
    } catch (error: unknown) {
      const stockConflictItems = getStockConflictItems(error, cartItems);

      if (stockConflictItems.length > 0) {
        dispatch(
          setCartItems(
            applyStockConflictsToCartItems(cartItems, stockConflictItems),
          ),
        );

        dispatch(cartApi.util.invalidateTags(['Product']));

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

  function handleCheckoutDialogClose(): void {
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
