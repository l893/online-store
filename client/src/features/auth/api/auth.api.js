import { api } from '../../../shared/lib';
import { normalizeUser } from '../lib/normalize-user';
import {
  authenticatedSessionCleared,
  authenticatedSessionEstablished,
} from '../model/auth-session.events';
import { setCredentials, logout as logoutAction } from '../model/auth.slice';

const storeAccessToken = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
};

const removeStoredAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

function completeAuthentication({ response, dispatch }) {
  const normalizedUser = normalizeUser(response.user);

  dispatch(
    setCredentials({
      ...response,
      user: normalizedUser,
    }),
  );

  storeAccessToken(response.accessToken);

  dispatch(authenticatedSessionEstablished());
}

export const authApi = api.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    register: endpointBuilder.mutation({
      query: (request) => ({
        url: '/auth/register',
        method: 'POST',
        body: request,
      }),
      async onQueryStarted(request, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          completeAuthentication({
            response,
            dispatch,
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
      async onQueryStarted(request, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          completeAuthentication({
            response,
            dispatch,
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
          dispatch(api.util.resetApiState());
          dispatch(authenticatedSessionCleared());
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
