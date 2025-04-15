// src/redux/slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {products} from '../../types';

const initialState: products.ProductState = {
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
      state.products = [];
    },
    productSuccess: (state, action: PayloadAction<object>) => {
      const newProducts = action.payload?.data;
      const hasMore = newProducts?.current_page < newProducts?.last_page;

      state.products = {
        ...state.products,
        data: {
          ...state.products,
          data: [...(state.products || []), ...newProducts?.data],
        },
      };

      state.hasMore = hasMore;
      state.loading = false;
    },
    productFailed: (state, action: PayloadAction<products.ErrorPayload>) => {
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

export const {productStart, productSuccess, productFailed, resetProducts} =
  productSlice.actions;

export default productSlice.reducer;
