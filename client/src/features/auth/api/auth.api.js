import { api } from '../../../shared/lib/api';
import { setCartItems } from '../../cart';
import { normalizeUser } from '../lib/normalize-user';
import { setCredentials, logout as logoutAction } from '../model/auth.slice';
import { synchronizeCartAfterAuthentication } from './synchronize-cart-after-authentication';

const storeAccessToken = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
};

const removeStoredAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

async function completeAuthentication({ response, dispatch, getState }) {
  const normalizedUser = normalizeUser(response.user);

  dispatch(
    setCredentials({
      ...response,
      user: normalizedUser,
    }),
  );

  storeAccessToken(response.accessToken);

  await synchronizeCartAfterAuthentication({
    dispatch,
    getState,
  });
}

export const authApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    register: endpointBuilder.mutation({
      query: (request) => ({
        url: '/auth/register',
        method: 'POST',
        body: request,
      }),
      async onQueryStarted(request, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          await completeAuthentication({
            response,
            dispatch,
            getState,
          });
        } catch {
          // Ошибка доступна через RTK Query mutation state.
        }
      },
    }),
    login: endpointBuilder.mutation({
      query: (request) => ({
        url: '/auth/login',
        method: 'POST',
        body: request,
      }),
      async onQueryStarted(request, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          await completeAuthentication({
            response,
            dispatch,
            getState,
          });
        } catch {
          // Ошибка доступна через RTK Query mutation state.
        }
      },
    }),
    refresh: endpointBuilder.mutation({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      async onQueryStarted(request, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;
          const normalizedUser = normalizeUser(response.user);

          dispatch(
            setCredentials({
              ...response,
              user: normalizedUser,
            }),
          );

          storeAccessToken(response.accessToken);
        } catch {
          removeStoredAuthTokens();
          // Ошибка refresh не требует локального UI-обработчика.
        }
      },
    }),
    logout: endpointBuilder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(request, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          removeStoredAuthTokens();
          dispatch(logoutAction());
          dispatch(setCartItems([]));
          dispatch(api.util.resetApiState());
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
