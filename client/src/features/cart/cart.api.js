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
    // Новый запрос для удаления товара из корзины
    removeItemFromCart: build.mutation({
      query: (productId) => ({
        url: `/cart/item/${productId}`,
        method: 'DELETE',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCartQuery,
  useReplaceCartMutation,
  useRemoveItemFromCartMutation,
} = cartApi;
