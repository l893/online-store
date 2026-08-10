const { isValidObjectId } = require('mongoose');

const PRODUCT_SEARCH_FIELD_NAMES = ['title', 'slug', 'description'];
const PRODUCT_SEARCH_QUERY_MAX_LENGTH = 100;

const PRODUCT_WORD_SEPARATOR_PATTERN = '[^a-zа-яё0-9]+';

function isProductSearchQueryTooLong(searchValue) {
  return String(searchValue ?? '').length > PRODUCT_SEARCH_QUERY_MAX_LENGTH;
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeExactSearchValue(searchValue) {
  return String(searchValue ?? '')
    .trim()
    .toLowerCase()
    .replace(/[‐-‒–—−]/g, '-');
}

function createSearchTokens(searchValue) {
  const normalizedSearchValue = normalizeExactSearchValue(searchValue)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalizedSearchValue) {
    return [];
  }

  return normalizedSearchValue.split(' ');
}

function createWordPrefixRegularExpression(searchToken) {
  const escapedSearchToken = escapeRegularExpression(searchToken);

  return new RegExp(
    `(?:^|${PRODUCT_WORD_SEPARATOR_PATTERN})${escapedSearchToken}`,
    'i',
  );
}

function createSearchTokenFilter(searchToken) {
  const wordPrefixRegularExpression =
    createWordPrefixRegularExpression(searchToken);

  return {
    $or: PRODUCT_SEARCH_FIELD_NAMES.map((searchFieldName) => ({
      [searchFieldName]: wordPrefixRegularExpression,
    })),
  };
}

function createProductSearchFilter(
  searchValue,
  { includeExactIdentifierMatches = false } = {},
) {
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

  const exactIdentifierFilters = [
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

module.exports = {
  createProductSearchFilter,
  isProductSearchQueryTooLong,
};
