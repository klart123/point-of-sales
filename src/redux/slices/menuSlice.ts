// src/redux/slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type ErrorPayload = string | Record<string, any>;

type AuthState = {
  menu: null | object;
  loading: boolean;
  error: string | null | Record<string, any>;
  hasMore: boolean;
};

const initialState: AuthState = {
  menu: null,
  loading: false,
  error: null,
  hasMore: false,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    menuStart: state => {
      state.loading = true;
      state.menu = null;
    },
    menuSuccess: (state, action: PayloadAction<object>) => {
      state.loading = false;
      state.menu = action.payload;
    },
    menuFailed: (state, action: PayloadAction<ErrorPayload>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetMenu: state => {
      state.menu = null;
      state.hasMore = true;
      state.loading = false;
    },
  },
});

export const {menuStart, menuSuccess, menuFailed, resetMenu} =
  menuSlice.actions;

export default menuSlice.reducer;
