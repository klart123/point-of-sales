// src/redux/slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {products} from '../../types';

const initialState: products.ProductState = {
  products: null,
  loading: false,
  error: null,
  hasMore: false,
  isSuccess: false,
};

const productSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    productStart: state => {
      state.loading = true;
      state.products = [];
    },
    productSuccess: (state, action: PayloadAction<object>) => {
      state.loading = false;
      state.products = action.payload;
    },
    productFailed: (state, action: PayloadAction<products.ErrorPayload>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addProductStart: state => {
      state.loading = true;
      state.isSuccess = false;
    },
    addProductSuccess: state => {
      state.loading = false;
      state.isSuccess = true;
    },
    addProductFailed: (state, action: PayloadAction<products.ErrorPayload>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetProducts: state => {
      state.products = null;
      state.hasMore = true;
      state.loading = false;
    },
  },
});

export const productActions = productSlice.actions;

export default productSlice.reducer;
