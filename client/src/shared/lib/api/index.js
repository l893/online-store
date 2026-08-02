import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getStoredAccessToken } from './access-token-storage';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE || '/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const accessToken = getStoredAccessToken();

    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['AdminProduct', 'Product'],
  endpoints: () => ({}),
});
