import productImagePlaceholderUrl from '../assets/product-image-placeholder.svg';

interface ProductImageErrorEvent {
  readonly currentTarget: HTMLImageElement;
}

export const PRODUCT_IMAGE_PLACEHOLDER_URL = productImagePlaceholderUrl;

export function replaceBrokenProductImageWithPlaceholder(
  event: ProductImageErrorEvent,
): void {
  const imageElement = event.currentTarget;

  if (imageElement.getAttribute('src') === PRODUCT_IMAGE_PLACEHOLDER_URL) {
    return;
  }

  imageElement.src = PRODUCT_IMAGE_PLACEHOLDER_URL;
}
