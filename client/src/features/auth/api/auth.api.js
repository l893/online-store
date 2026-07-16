import { api } from '../../../shared/lib/api';
import { mergeCartItems, setAll } from '../../cart';
import { normalizeUser } from '../lib/normalize-user';
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

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const user = normalizeUser(data.user);
          dispatch(setCredentials({ ...data, user }));

          storeAccessToken(data.accessToken);

          const localCartItems = getState().cart.items || [];

          const serverCartResponse = await dispatch(
            api.endpoints.getCart.initiate(undefined, {
              forceRefetch: true,
              subscribe: false,
            }),
          ).unwrap();

          const serverCartItems = Array.isArray(serverCartResponse.items)
            ? serverCartResponse.items
            : [];

          if (localCartItems.length > 0) {
            const mergedCartItems = mergeCartItems({
              serverItems: serverCartItems,
              localItems: localCartItems,
            });

            const updatedCartResponse = await dispatch(
              api.endpoints.replaceCart.initiate(mergedCartItems),
            ).unwrap();

            dispatch(setAll(updatedCartResponse.items || []));
          } else {
            dispatch(setAll(serverCartItems));
          }
        } catch {
          // Ошибка доступна через RTK Query mutation state.
        }
      },
    }),
    login: build.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const user = normalizeUser(data.user);
          dispatch(setCredentials({ ...data, user }));

          storeAccessToken(data.accessToken);

          const localCartItems = getState().cart.items || [];

          const serverCartResponse = await dispatch(
            api.endpoints.getCart.initiate(undefined, {
              forceRefetch: true,
              subscribe: false,
            }),
          ).unwrap();

          const serverCartItems = Array.isArray(serverCartResponse.items)
            ? serverCartResponse.items
            : [];

          if (localCartItems.length > 0) {
            const mergedCartItems = mergeCartItems({
              serverItems: serverCartItems,
              localItems: localCartItems,
            });

            const updatedCartResponse = await dispatch(
              api.endpoints.replaceCart.initiate(mergedCartItems),
            ).unwrap();

            dispatch(setAll(updatedCartResponse.items || []));
          } else {
            dispatch(setAll(serverCartItems));
          }
        } catch {
          // Ошибка доступна через RTK Query mutation state.
        }
      },
    }),
    refresh: build.mutation({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const user = normalizeUser(data.user);
          dispatch(setCredentials({ ...data, user }));
          storeAccessToken(data.accessToken);
        } catch {
          removeStoredAuthTokens();
          // Ошибка refresh не требует локального UI-обработчика.
        }
      },
    }),
    logout: build.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          removeStoredAuthTokens();
          dispatch(logoutAction());
          dispatch(setAll([])); // очистим локальную корзину
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
