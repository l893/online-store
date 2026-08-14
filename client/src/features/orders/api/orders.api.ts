import { api } from '@shared/lib';

import type {
  ConfirmCheckoutRequest,
  ConfirmCheckoutResponse,
  CreateOrderResponse,
} from './orders.types';

export const ordersApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    createOrder: endpointBuilder.mutation<CreateOrderResponse, void>({
      query: () => ({
        url: '/orders',
        method: 'POST',
        body: {},
      }),
    }),
    confirmCheckout: endpointBuilder.mutation<
      ConfirmCheckoutResponse,
      ConfirmCheckoutRequest
    >({
      query: ({ orderId }) => ({
        url: '/orders/checkout/confirm',
        method: 'POST',
        body: { orderId },
      }),
    }),
  }),
});

export const { useCreateOrderMutation, useConfirmCheckoutMutation } = ordersApi;
