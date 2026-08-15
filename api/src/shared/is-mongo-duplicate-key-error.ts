function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isMongoDuplicateKeyError(
  error: unknown,
  fieldName?: string,
): boolean {
  if (!isRecord(error) || error.code !== 11000) {
    return false;
  }

  if (!fieldName) {
    return true;
  }

  return Boolean(
    (isRecord(error.keyPattern) && error.keyPattern[fieldName]) ||
    (isRecord(error.keyValue) &&
      Object.prototype.hasOwnProperty.call(error.keyValue, fieldName)),
  );
}
