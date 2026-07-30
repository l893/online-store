import { api } from '../../../shared/lib';

export const ordersApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    createOrder: endpointBuilder.mutation({
      query: (request) => ({
        url: '/orders',
        method: 'POST',
        body: request ?? {},
      }),
    }),
    confirmCheckout: endpointBuilder.mutation({
      query: ({ orderId }) => ({
        url: '/orders/checkout/confirm',
        method: 'POST',
        body: { orderId },
      }),
    }),
  }),
});

export const { useCreateOrderMutation, useConfirmCheckoutMutation } = ordersApi;
