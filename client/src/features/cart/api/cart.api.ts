import { api } from '@shared/lib';

import type { CartItem } from '../model/cart.types';
import type { CartResponse } from './cart.types';

export const cartApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    getCart: endpointBuilder.query<CartResponse, void>({
      query: () => '/cart',
    }),
    replaceCart: endpointBuilder.mutation<CartResponse, readonly CartItem[]>({
      query: (cartItems) => ({
        url: '/cart',
        method: 'PUT',
        body: {
          items: cartItems,
        },
      }),
    }),
    removeItemFromCart: endpointBuilder.mutation<CartResponse, string>({
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
  useLazyGetCartQuery,
  useReplaceCartMutation,
  useRemoveItemFromCartMutation,
} = cartApi;

export type ReplaceCartTrigger = ReturnType<typeof useReplaceCartMutation>[0];
