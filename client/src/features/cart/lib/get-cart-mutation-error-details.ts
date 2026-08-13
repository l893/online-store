interface CartMutationErrorDetails {
  readonly isInsufficientStockError: boolean;
  readonly availableStock: number | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getCartMutationErrorDetails(
  error: unknown,
): CartMutationErrorDetails {
  const errorData = isRecord(error) && isRecord(error.data) ? error.data : null;

  const isInsufficientStockError = errorData?.code === 'INSUFFICIENT_STOCK';
  const normalizedAvailableStock = Number(errorData?.availableStock);
  const hasAvailableStock =
    Number.isFinite(normalizedAvailableStock) && normalizedAvailableStock >= 0;

  return {
    isInsufficientStockError,
    availableStock: hasAvailableStock ? normalizedAvailableStock : null,
  };
}
