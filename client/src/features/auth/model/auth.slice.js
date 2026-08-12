import { createSlice } from '@reduxjs/toolkit';
import { authenticationSessionExpired } from '@shared/lib';

const initialAuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setCredentials: (state, action) => {
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

export default authSlice.reducer;
