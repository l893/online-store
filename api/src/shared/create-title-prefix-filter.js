function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createTitlePrefixFilter(searchValue) {
  const normalizedSearchValue = String(searchValue ?? '').trim();

  if (!normalizedSearchValue) {
    return {};
  }

  const escapedSearchValue = escapeRegularExpression(normalizedSearchValue);

  return {
    title: new RegExp(`^${escapedSearchValue}`, 'i'),
  };
}

module.exports = {
  createTitlePrefixFilter,
};
