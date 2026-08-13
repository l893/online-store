import { createAction } from '@reduxjs/toolkit';

interface AuthSessionChangePreparedAction {
  readonly payload: string;
}

function prepareAuthSessionChangeEvent(): AuthSessionChangePreparedAction {
  return {
    payload: crypto.randomUUID(),
  };
}

export const authenticatedSessionEstablished = createAction(
  'auth/authenticatedSessionEstablished',
  prepareAuthSessionChangeEvent,
);

export const authenticatedSessionCleared = createAction(
  'auth/authenticatedSessionCleared',
  prepareAuthSessionChangeEvent,
);
