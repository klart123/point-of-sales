// src/redux/slices/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {products} from '../../types';
import {resetCategories} from '../../screens/Products/services';

const initialState: products.ProductState = {
  products: null,
  loading: false,
  error: null,
  hasMore: false,
  isSuccess: false,
  categories: [],
  isAddingLoading: false,
  isAddingSuccess: false,
  prodCatLoading: false,
  prodCatSuccess: false,
  prodCatError: null,
};

const productSlice = createSlice({
  name: 'product',
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
      state.isAddingLoading = true;
      state.isAddingSuccess = false;
    },
    addProductSuccess: state => {
      state.loading = false;
      state.isSuccess = true;
      state.isAddingLoading = false;
      state.isAddingSuccess = true;
    },
    addProductFailed: (state, action: PayloadAction<products.ErrorPayload>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAddingLoading = false;
      state.isAddingSuccess = false;
    },

    getCategoriesStart: state => {
      state.loading = true;
      state.categories = [];
    },
    getCategoriesSuccess: (
      state,
      action: PayloadAction<products.Category[]>,
    ) => {
      state.loading = false;
      state.categories = action.payload;
    },
    getCategoriesFailed: (
      state,
      action: PayloadAction<products.ErrorPayload>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },
    getSubCategoriesStart: state => {
      state.loading = true;
      state.productCategories = [];
    },
    getSubCategoriesSuccess: (
      state,
      action: PayloadAction<products.ProductCategory[]>,
    ) => {
      state.loading = false;
      state.productCategories = action.payload;
    },
    getSubCategoriesFailed: (
      state,
      action: PayloadAction<products.ErrorPayload>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },
    getProductsGroupedStart: state => {
      state.loading = true;
      state.productsGrouped = [];
    },
    getProductsGroupedSuccess: (
      state,
      action: PayloadAction<products.ProductCategory[]>,
    ) => {
      state.loading = false;
      state.productsGrouped = action.payload;
    },
    getProductsGroupedFailed: (
      state,
      action: PayloadAction<products.ErrorPayload>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },
    addProductCategoryStart: state => {
      state.prodCatLoading = true;
      state.prodCatSuccess = false;
      state.prodCatError = null;
    },
    addProductCategorySuccess: state => {
      console.log('addProductCategorySuccess reducer called');
      state.prodCatLoading = false;
      state.prodCatSuccess = true;
    },
    addProductCategoryFailed: (
      state,
      action: PayloadAction<products.ErrorPayload>,
    ) => {
      state.prodCatLoading = false;
      state.prodCatSuccess = false;
      state.prodCatError = action.payload;
    },
    resetCategories: state => {
      state.categories = [];
    },
    resetProductCategories: state => {
      state.prodCatLoading = false;
      state.prodCatSuccess = false;
    },
    resetProductsGrouped: state => {
      state.productsGrouped = [];
    },
    resetError: state => {
      state.error = null;
    },
    resetProducts: state => {
      state.products = null;
      state.hasMore = true;
      state.loading = false;
    },
    resetAddProductState: state => {
      state.isAddingLoading = false;
      state.isAddingSuccess = false;
    },
  },
});

export const productActions = productSlice.actions;

export default productSlice.reducer;
