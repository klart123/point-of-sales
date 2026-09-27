// src/redux/slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {auth} from '../../types';

const initialState: auth.AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: true,
  error: null,
  loginIsLoading: false,
  registerIsLoading: false,
  userRegistered: false,
  registrationError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.loginIsLoading = true;
      state.loading = true;
      state.error = null;
      state.isAuthenticated = false;
    },
    loginSuccess: (state, action: PayloadAction<any>) => {
      const {token, user} = action.payload;
      state.isAuthenticated = true;
      state.token = token;
      state.user = user;
      state.loading = false;
      state.loginIsLoading = false;
    },
    loginFailed: (state, action: PayloadAction<any>) => {
      state.isAuthenticated = false;
      state.error = action.payload;
      state.loading = false;
      state.loginIsLoading = false;
    },
    logout: state => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
    registerStart: state => {
      state.registerIsLoading = true;

      state.userRegistered = false;
      state.loading = true;
      state.error = null;
      state.registrationError = null;
    },
    registerSuccess: (
      state,
      action: PayloadAction<{name: string; email: string}>,
    ) => {
      state.user = action.payload;
      state.loading = false;
      state.userRegistered = true;
      state.registerIsLoading = false;
    },
    registerFailure: (state, action: PayloadAction<auth.ErrorPayload>) => {
      state.loading = false;
      state.registrationError = action.payload;
      state.registerIsLoading = false;

      state.userRegistered = false;
    },
    resetLoginData: state => {
      state.loading = false;
      state.loginIsLoading = false;
      state.error = null;
    },
    resetRegistration: state => {
      console.log('resetRegistration');
      state.loading = false;
      state.registerIsLoading = false;
      state.error = null;
      state.userRegistered = false;
      state.registrationError = null;
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
  resetLoginData,
  resetRegistration,
} = authSlice.actions;

export default authSlice.reducer;
