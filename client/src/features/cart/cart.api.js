import { api } from '../../shared/lib/api';

export const cartApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query({
      query: () => '/cart',
    }),
    replaceCart: build.mutation({
      // полная замена items на сервере
      query: (items) => ({ url: '/cart', method: 'PUT', body: { items } }),
    }),
  }),
});

export const { useGetCartQuery, useReplaceCartMutation } = cartApi;
