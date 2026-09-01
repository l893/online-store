import productImagePlaceholderUrl from '../assets/product-image-placeholder.svg';

interface ProductImageErrorEvent {
  readonly currentTarget: HTMLImageElement;
}

interface ProductImageSources {
  readonly primaryUrl: string;
  readonly fallbackUrl?: string;
}

const PRODUCT_IMAGE_GITHUB_URL_PREFIX =
  'https://raw.githubusercontent.com/l893/online-store-assets/main/';
const PRODUCT_IMAGE_VPS_URL_PREFIX = '/product-images/';

export const PRODUCT_IMAGE_PLACEHOLDER_URL = productImagePlaceholderUrl;

export function getProductImageSources(
  imageUrl: string | undefined,
): ProductImageSources {
  if (!imageUrl) {
    return {
      primaryUrl: PRODUCT_IMAGE_PLACEHOLDER_URL,
    };
  }

  if (!imageUrl.startsWith(PRODUCT_IMAGE_GITHUB_URL_PREFIX)) {
    return {
      primaryUrl: imageUrl,
    };
  }

  const imageFileName = imageUrl.slice(PRODUCT_IMAGE_GITHUB_URL_PREFIX.length);

  if (!imageFileName || imageFileName.includes('/')) {
    return {
      primaryUrl: imageUrl,
    };
  }

  return {
    primaryUrl: `${PRODUCT_IMAGE_VPS_URL_PREFIX}${imageFileName}`,
    fallbackUrl: imageUrl,
  };
}

export function replaceBrokenProductImageWithFallback(
  event: ProductImageErrorEvent,
): void {
  const imageElement = event.currentTarget;
  const fallbackUrl = imageElement.dataset.fallbackSrc;

  if (fallbackUrl) {
    delete imageElement.dataset.fallbackSrc;
    imageElement.src = fallbackUrl;
    return;
  }

  if (imageElement.getAttribute('src') === PRODUCT_IMAGE_PLACEHOLDER_URL) {
    return;
  }

  imageElement.src = PRODUCT_IMAGE_PLACEHOLDER_URL;
}
