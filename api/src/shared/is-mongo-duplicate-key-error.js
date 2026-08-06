function isMongoDuplicateKeyError(error, fieldName) {
  if (error?.code !== 11000) {
    return false;
  }

  if (!fieldName) {
    return true;
  }

  return Boolean(
    error.keyPattern?.[fieldName] ||
    Object.prototype.hasOwnProperty.call(error.keyValue || {}, fieldName),
  );
}

module.exports = {
  isMongoDuplicateKeyError,
};
