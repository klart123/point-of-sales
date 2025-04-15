// src/redux/slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type ErrorPayload = string | Record<string, any>;

type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  user: {name: string; email: string} | null;
  loading: boolean;
  error: string | null | Record<string, any>;
};

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.token = action.payload;
    },
    logout: state => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
    registerStart: state => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (
      state,
      action: PayloadAction<{name: string; email: string}>,
    ) => {
      state.user = action.payload;
      state.loading = false;
    },
    registerFailure: (state, action: PayloadAction<ErrorPayload>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {registerStart, registerSuccess, registerFailure, logout} =
  authSlice.actions;

export default authSlice.reducer;
