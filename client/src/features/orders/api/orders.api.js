import { api } from '../../../shared/lib/api';

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation({
      // тело можно опустить: сервер создаст заказ из серверной корзины
      query: (payload) => ({
        url: '/orders',
        method: 'POST',
        body: payload ?? {},
      }),
    }),
    confirmCheckout: build.mutation({
      query: ({ orderId }) => ({
        url: '/orders/checkout/confirm',
        method: 'POST',
        body: { orderId },
      }),
    }),
  }),
});

export const { useCreateOrderMutation, useConfirmCheckoutMutation } = ordersApi;
