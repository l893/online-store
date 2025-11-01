export function parseApiError(error) {
  if (!error) return 'Unknown error';
  // RTK Query: error?.data?.message или error?.error
  if (typeof error === 'string') return error;
  if (error?.data?.message) return error.data.message;
  if (error?.error) return error.error;
  return 'Request failed';
}
