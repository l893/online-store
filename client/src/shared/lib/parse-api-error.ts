function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseApiError(error: unknown): string {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;

  if (!isRecord(error)) {
    return 'Request failed';
  }

  if (
    isRecord(error.data) &&
    typeof error.data.message === 'string' &&
    error.data.message
  ) {
    return error.data.message;
  }

  if (typeof error.error === 'string' && error.error) {
    return error.error;
  }

  return 'Request failed';
}
