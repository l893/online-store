import type { Category } from '@entities/categories';
import type { ProductSortValue } from '@entities/products';

const DEFAULT_CATALOG_SORT_VALUE: ProductSortValue = 'price_asc';

export function normalizeCatalogPageNumber(
  pageParameterValue: string | null,
): number {
  const parsedPageNumber = Number(pageParameterValue);

  if (!Number.isInteger(parsedPageNumber) || parsedPageNumber < 1) {
    return 1;
  }

  return parsedPageNumber;
}

export function normalizeCatalogSortValue(
  sortParameterValue: string | null,
): ProductSortValue {
  if (
    sortParameterValue === 'price_asc' ||
    sortParameterValue === 'price_desc'
  ) {
    return sortParameterValue;
  }

  return DEFAULT_CATALOG_SORT_VALUE;
}

export function normalizeCatalogCategorySlug(
  categoryParameterValue: string | null,
): string {
  return typeof categoryParameterValue === 'string'
    ? categoryParameterValue.trim()
    : '';
}

export function isKnownCatalogCategorySlug(
  categorySlug: string,
  categories: readonly Category[] = [],
): boolean {
  return (
    !categorySlug ||
    categories.some((category) => category.slug === categorySlug)
  );
}
