import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  getStoredAccessToken,
  removeStoredAccessToken,
  storeAccessToken,
} from './access-token-storage';
import { authenticationSessionExpired } from './authentication-session.events';

const ACCESS_TOKEN_REFRESH_LOCK_NAME = 'access-token-refresh';

const executeBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE || '/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const accessToken = getStoredAccessToken();

    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

let pendingAccessTokenRefreshPromise = null;
let accessTokenRefreshRevision = 0;

export function invalidatePendingAccessTokenRefresh() {
  accessTokenRefreshRevision += 1;
}

function getRequestUrl(requestArguments) {
  return typeof requestArguments === 'string'
    ? requestArguments
    : requestArguments.url;
}

function isAuthenticationRequest(requestArguments) {
  return getRequestUrl(requestArguments).startsWith('/auth/');
}

async function runWithCrossTabAccessTokenRefreshLock(refreshOperation) {
  const lockManager = typeof navigator === 'undefined' ? null : navigator.locks;

  if (!lockManager?.request) {
    return refreshOperation();
  }

  return lockManager.request(ACCESS_TOKEN_REFRESH_LOCK_NAME, refreshOperation);
}

async function performAccessTokenRefresh({
  baseQueryApi,
  extraOptions,
  accessTokenAtRequestStart,
  expectedAccessTokenRefreshRevision,
}) {
  if (expectedAccessTokenRefreshRevision !== accessTokenRefreshRevision) {
    return false;
  }

  const currentAccessToken = getStoredAccessToken();

  if (!currentAccessToken) {
    return false;
  }

  if (currentAccessToken !== accessTokenAtRequestStart) {
    return true;
  }

  const refreshResult = await executeBaseQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
    },
    baseQueryApi,
    extraOptions,
  );

  if (expectedAccessTokenRefreshRevision !== accessTokenRefreshRevision) {
    return false;
  }

  const refreshedAccessToken = refreshResult.data?.accessToken;

  if (typeof refreshedAccessToken === 'string' && refreshedAccessToken) {
    storeAccessToken(refreshedAccessToken);
    return true;
  }

  const refreshErrorStatus = refreshResult.error?.status;
  const isRefreshSessionRejected =
    refreshErrorStatus === 401 || refreshErrorStatus === 403;
  const isSuccessfulResponseMalformed = !refreshResult.error;

  if (isRefreshSessionRejected || isSuccessfulResponseMalformed) {
    removeStoredAccessToken();
    baseQueryApi.dispatch(authenticationSessionExpired());
  }

  return false;
}

async function refreshAccessToken({
  baseQueryApi,
  extraOptions,
  accessTokenAtRequestStart,
  expectedAccessTokenRefreshRevision,
}) {
  if (!pendingAccessTokenRefreshPromise) {
    const accessTokenRefreshPromise = runWithCrossTabAccessTokenRefreshLock(
      () =>
        performAccessTokenRefresh({
          baseQueryApi,
          extraOptions,
          accessTokenAtRequestStart,
          expectedAccessTokenRefreshRevision,
        }),
    );

    pendingAccessTokenRefreshPromise = accessTokenRefreshPromise;

    try {
      return await accessTokenRefreshPromise;
    } finally {
      if (pendingAccessTokenRefreshPromise === accessTokenRefreshPromise) {
        pendingAccessTokenRefreshPromise = null;
      }
    }
  }

  return pendingAccessTokenRefreshPromise;
}

async function baseQueryWithAutomaticAccessTokenRefresh(
  requestArguments,
  baseQueryApi,
  extraOptions,
) {
  const accessTokenAtRequestStart = getStoredAccessToken();
  const accessTokenRefreshRevisionAtRequestStart = accessTokenRefreshRevision;

  const requestResult = await executeBaseQuery(
    requestArguments,
    baseQueryApi,
    extraOptions,
  );

  const shouldAttemptAccessTokenRefresh =
    requestResult.error?.status === 401 &&
    Boolean(accessTokenAtRequestStart) &&
    !isAuthenticationRequest(requestArguments) &&
    accessTokenRefreshRevisionAtRequestStart === accessTokenRefreshRevision;

  if (!shouldAttemptAccessTokenRefresh) {
    return requestResult;
  }

  const wasAccessTokenRefreshed = await refreshAccessToken({
    baseQueryApi,
    extraOptions,
    accessTokenAtRequestStart,
    expectedAccessTokenRefreshRevision:
      accessTokenRefreshRevisionAtRequestStart,
  });

  if (
    !wasAccessTokenRefreshed ||
    accessTokenRefreshRevisionAtRequestStart !== accessTokenRefreshRevision
  ) {
    return requestResult;
  }

  return executeBaseQuery(requestArguments, baseQueryApi, extraOptions);
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAutomaticAccessTokenRefresh,
  tagTypes: ['AdminProduct', 'Product'],
  endpoints: () => ({}),
});
