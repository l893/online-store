import { createAction } from '@reduxjs/toolkit';

function prepareAuthenticationSessionExpiredEvent() {
  return {
    payload: crypto.randomUUID(),
  };
}

export const authenticationSessionExpired = createAction(
  'api/authenticationSessionExpired',
  prepareAuthenticationSessionExpiredEvent,
);
