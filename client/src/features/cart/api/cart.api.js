import { api } from '../../../shared/lib/api';

export const cartApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    getCart: endpointBuilder.query({
      query: () => '/cart',
    }),
    replaceCart: endpointBuilder.mutation({
      query: (cartItems) => ({
        url: '/cart',
        method: 'PUT',
        body: {
          items: cartItems,
        },
      }),
    }),
    removeItemFromCart: endpointBuilder.mutation({
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
