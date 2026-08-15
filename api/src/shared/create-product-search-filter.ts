import { isValidObjectId } from 'mongoose';

const PRODUCT_SEARCH_FIELD_NAMES: readonly string[] = [
  'title',
  'slug',
  'description',
];
const PRODUCT_SEARCH_QUERY_MAX_LENGTH = 100;

const PRODUCT_WORD_SEPARATOR_PATTERN = '[^a-zа-яё0-9]+';

interface CreateProductSearchFilterOptions {
  readonly includeExactIdentifierMatches?: boolean;
}

type ProductSearchFilter = Record<string, unknown>;

export function isProductSearchQueryTooLong(searchValue: unknown): boolean {
  return String(searchValue ?? '').length > PRODUCT_SEARCH_QUERY_MAX_LENGTH;
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeExactSearchValue(searchValue: unknown): string {
  return String(searchValue ?? '')
    .trim()
    .toLowerCase()
    .replace(/[‐-‒–—−]/g, '-');
}

function createSearchTokens(searchValue: unknown): string[] {
  const normalizedSearchValue = normalizeExactSearchValue(searchValue)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalizedSearchValue) {
    return [];
  }

  return normalizedSearchValue.split(' ');
}

function createWordPrefixRegularExpression(searchToken: string): RegExp {
  const escapedSearchToken = escapeRegularExpression(searchToken);

  return new RegExp(
    `(?:^|${PRODUCT_WORD_SEPARATOR_PATTERN})${escapedSearchToken}`,
    'i',
  );
}

function createSearchTokenFilter(searchToken: string): ProductSearchFilter {
  const wordPrefixRegularExpression =
    createWordPrefixRegularExpression(searchToken);

  return {
    $or: PRODUCT_SEARCH_FIELD_NAMES.map((searchFieldName) => ({
      [searchFieldName]: wordPrefixRegularExpression,
    })),
  };
}

export function createProductSearchFilter(
  searchValue: unknown,
  {
    includeExactIdentifierMatches = false,
  }: CreateProductSearchFilterOptions = {},
): ProductSearchFilter {
  const searchTokens = createSearchTokens(searchValue);

  if (searchTokens.length === 0) {
    return {};
  }

  const searchTokenFilters = searchTokens.map(createSearchTokenFilter);

  const wordPrefixSearchFilter =
    searchTokenFilters.length === 1
      ? searchTokenFilters[0]
      : {
          $and: searchTokenFilters,
        };

  if (!includeExactIdentifierMatches) {
    return wordPrefixSearchFilter;
  }

  const normalizedExactSearchValue = normalizeExactSearchValue(searchValue);

  const exactIdentifierFilters: ProductSearchFilter[] = [
    {
      slug: normalizedExactSearchValue,
    },
  ];

  if (isValidObjectId(normalizedExactSearchValue)) {
    exactIdentifierFilters.push({
      _id: normalizedExactSearchValue,
    });
  }

  return {
    $or: [...exactIdentifierFilters, wordPrefixSearchFilter],
  };
}
