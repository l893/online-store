const DEFAULT_CATALOG_SORT_VALUE = 'price_asc';

const SUPPORTED_CATALOG_SORT_VALUES = new Set(['price_asc', 'price_desc']);

export function normalizeCatalogPageNumber(pageParameterValue) {
  const parsedPageNumber = Number(pageParameterValue);

  if (!Number.isInteger(parsedPageNumber) || parsedPageNumber < 1) {
    return 1;
  }

  return parsedPageNumber;
}

export function normalizeCatalogSortValue(sortParameterValue) {
  return SUPPORTED_CATALOG_SORT_VALUES.has(sortParameterValue)
    ? sortParameterValue
    : DEFAULT_CATALOG_SORT_VALUE;
}

export function normalizeCatalogCategorySlug(categoryParameterValue) {
  return typeof categoryParameterValue === 'string'
    ? categoryParameterValue.trim()
    : '';
}

export function isKnownCatalogCategorySlug(categorySlug, categories = []) {
  return (
    !categorySlug ||
    categories.some((category) => category.slug === categorySlug)
  );
}
