import { createAction } from '@reduxjs/toolkit';

interface AuthenticationSessionExpiredPreparedAction {
  readonly payload: string;
}

function prepareAuthenticationSessionExpiredEvent(): AuthenticationSessionExpiredPreparedAction {
  return {
    payload: crypto.randomUUID(),
  };
}

export const authenticationSessionExpired = createAction(
  'api/authenticationSessionExpired',
  prepareAuthenticationSessionExpiredEvent,
);
