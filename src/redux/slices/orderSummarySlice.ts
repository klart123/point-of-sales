// src/redux/slices/apiSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface userState {
  data: object | null;
  loading: boolean;
  error: string | object | null;
  orderDates: object | null;
  datesError: object | null;
}

const initialState: userState = {
  data: null,
  loading: false,
  error: null,
  orderDates: null,
  datesError: null,
};

const orderSummarySlice = createSlice({
  name: 'orderSummary',
  initialState,
  reducers: {
    getSummaryStart: state => {
      state.loading = true;
      state.data = null;
    },
    getSummarySuccess: (state, action: PayloadAction<object | null>) => {
      state.loading = false;
      state.data = action.payload?.data;
    },
    getSummaryFailed: (
      state,
      action: PayloadAction<string | object | null>,
    ) => {
      state.loading = false;
      state.error = action.payload;
    },
    getDatesStart: state => {
      state.loading = true;
      state.orderDates = null;
      state.datesError = null;
    },
    getDatesSuccess: (state, action: PayloadAction<object | null>) => {
      state.loading = false;
      state.orderDates = action.payload;
    },
    getDatesFailed: (state, action: PayloadAction<object | null>) => {
      state.loading = false;
      state.datesError = null;
    },
    resetSummary: state => {
      state.loading = false;
      state.data = null;
      state.error = '';
    },
  },
});

export const orderSummaryAction = orderSummarySlice.actions;
export default orderSummarySlice.reducer;
