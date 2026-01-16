import { api } from '../../shared/lib/api';
import { setCredentials, logout as logoutAction } from './auth.slice';
import { setAll } from '../cart/cart.slice';

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));

          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          // объединить локальную гостевую корзину с сервером
          const items = getState().cart.items;

          if (items?.length) {
            const res = await dispatch(
              api.endpoints.replaceCart.initiate(items),
            ).unwrap();

            dispatch(setAll(res.items || []));
          } else {
            // извлечь серверную корзину в локальную
            const res = await dispatch(
              api.endpoints.getCart.initiate(),
            ).unwrap();

            dispatch(setAll(res.items || []));
          }
        } catch {}
      },
    }),
    login: build.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));

          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          const items = getState().cart.items;

          if (items?.length) {
            const res = await dispatch(
              api.endpoints.replaceCart.initiate(items),
            ).unwrap();

            dispatch(setAll(res.items || []));
          } else {
            const res = await dispatch(
              api.endpoints.getCart.initiate(),
            ).unwrap();

            dispatch(setAll(res.items || []));
          }
        } catch {}
      },
    }),
    refresh: build.mutation({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {}
      },
    }),
    logout: build.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logoutAction());
          dispatch(setAll([])); // очистим локальную корзину
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApi;
