import type { ChangeEvent } from 'react';

import type { CartItem as CartItemData } from '@features/cart';
import {
  PRODUCT_IMAGE_PLACEHOLDER_URL,
  replaceBrokenProductImageWithPlaceholder,
} from '@shared/lib';
import { Button, Input } from '@shared/ui';

import styles from './cart-item.module.scss';

interface CartItemProps {
  readonly cartItem: CartItemData;
  readonly onCartItemQuantityChange: (
    productId: string,
    quantity: number,
  ) => void | Promise<void>;
  readonly onCartItemRemove: (productId: string) => void | Promise<void>;
  readonly areQuantityControlsDisabled?: boolean;
}

export const CartItem = ({
  cartItem,
  onCartItemQuantityChange,
  onCartItemRemove,
  areQuantityControlsDisabled = false,
}: CartItemProps) => {
  const cartItemImageUrl = cartItem.image || PRODUCT_IMAGE_PLACEHOLDER_URL;
  const availableStock = Math.max(0, Number(cartItem.stock) || 0);
  const isProductUnavailable = availableStock === 0;
  const isDecreaseQuantityButtonDisabled =
    areQuantityControlsDisabled || cartItem.qty <= 1;
  const isIncreaseQuantityButtonDisabled =
    areQuantityControlsDisabled || cartItem.qty >= availableStock;

  function handleQuantityInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    const parsedQuantity = Number.parseInt(event.target.value || '1', 10);
    const nextQuantity = Math.min(
      availableStock,
      Math.max(1, parsedQuantity || 1),
    );

    onCartItemQuantityChange(cartItem.productId, nextQuantity);
  }

  return (
    <div className={styles.cartItem}>
      <div className={styles.imageWrapper}>
        <img
          src={cartItemImageUrl}
          alt={cartItem.title}
          className={styles.image}
          loading="lazy"
          onError={replaceBrokenProductImageWithPlaceholder}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.title}>{cartItem.title}</div>
      </div>

      {isProductUnavailable ? (
        <div className={styles.unavailableMessage}>Товар закончился</div>
      ) : (
        <div className={styles.quantityControls}>
          <Button
            type="button"
            disabled={isDecreaseQuantityButtonDisabled}
            onClick={() =>
              onCartItemQuantityChange(cartItem.productId, cartItem.qty - 1)
            }
          >
            -
          </Button>
          <Input
            className={styles.quantityInput}
            fullWidth={false}
            type="number"
            value={cartItem.qty}
            disabled={areQuantityControlsDisabled}
            onChange={handleQuantityInputChange}
            slotProps={{
              htmlInput: {
                'aria-label': `Количество товара ${cartItem.title}`,
                min: 1,
                max: availableStock,
              },
            }}
          />
          <Button
            type="button"
            disabled={isIncreaseQuantityButtonDisabled}
            onClick={() =>
              onCartItemQuantityChange(cartItem.productId, cartItem.qty + 1)
            }
          >
            +
          </Button>
        </div>
      )}

      <div className={styles.price}>{cartItem.price * cartItem.qty} ₽</div>

      <button
        type="button"
        aria-label={`Удалить товар ${cartItem.title} из корзины`}
        className={styles.removeButton}
        onClick={() => onCartItemRemove(cartItem.productId)}
      >
        ✕
      </button>
    </div>
  );
};
