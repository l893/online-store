import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { authenticationSessionExpired } from '@shared/lib';

import type { AuthenticatedUser, AuthState } from './auth.types';

interface SetCredentialsPayload {
  readonly user: AuthenticatedUser;
}

interface AuthFeatureState {
  readonly auth: AuthState;
}

const initialAuthState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authenticationSessionExpired, (state) => {
      state.user = null;
    });
  },
});

export const { setCredentials, logout } = authSlice.actions;

export function selectAuthenticatedUser(
  state: AuthFeatureState,
): AuthenticatedUser | null {
  return state.auth.user;
}

export default authSlice.reducer;
