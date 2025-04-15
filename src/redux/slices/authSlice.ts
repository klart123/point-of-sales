// src/redux/slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {auth} from '../../types';

const initialState: auth.AuthState = {
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
    loginStart: state => {
      state.loading = true;
      state.isAuthenticated = false;
    },
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.token = action.payload;
    },
    loginFailed: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.error = action;
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
    registerFailure: (state, action: PayloadAction<auth.ErrorPayload>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailed,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
