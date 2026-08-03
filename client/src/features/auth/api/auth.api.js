import {
  api,
  removeStoredAccessToken,
  storeAccessToken,
} from '../../../shared/lib';
import { normalizeUser } from '../lib/normalize-user';
import {
  authenticatedSessionCleared,
  authenticatedSessionEstablished,
} from '../model/auth-session.events';
import { setCredentials, logout as logoutAction } from '../model/auth.slice';

function clearStoredAuthenticationData() {
  removeStoredAccessToken();

  try {
    localStorage.removeItem('refreshToken');
  } catch {
    // Legacy refresh token cleanup is best-effort.
  }
}

function completeAuthentication({ response, dispatch }) {
  const normalizedUser = normalizeUser(response.user);

  dispatch(
    setCredentials({
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
              user: normalizedUser,
            }),
          );

          storeAccessToken(response.accessToken);
        } catch {
          clearStoredAuthenticationData();
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
          clearStoredAuthenticationData();
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
