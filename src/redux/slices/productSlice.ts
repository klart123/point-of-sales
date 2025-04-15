// src/redux/slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type ErrorPayload = string | Record<string, any>;

type AuthState = {
  products: null | object;
  loading: boolean;
  error: string | null | Record<string, any>;
  hasMore: boolean;
};

const initialState: AuthState = {
  products: null,
  loading: false,
  error: null,
  hasMore: false,
};

const productSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    productStart: state => {
      state.loading = true;
      state.products = null;
    },
    productSuccess: (state, action: PayloadAction<object>) => {
      console.log('productSlice', action.payload);
      state.loading = false;
      state.products = action.payload;
    },
    productFailed: (state, action: PayloadAction<ErrorPayload>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {productStart, productSuccess, productFailed} =
  productSlice.actions;

export default productSlice.reducer;
