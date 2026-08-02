import { createAction } from '@reduxjs/toolkit';

function prepareAuthSessionChangeEvent() {
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
