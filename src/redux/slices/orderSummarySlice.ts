// src/redux/slices/apiSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface userState {
  data: object | null;
  loading: boolean;
  error: string | object | null;
}

const initialState: userState = {
  data: null,
  loading: false,
  error: null,
};

const orderSummarySlice = createSlice({
  name: 'user',
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
    resetSummary: state => {
      state.loading = false;
      state.data = null;
      state.error = '';
    },
  },
});

export const orderSummaryAction = orderSummarySlice.actions;
export default orderSummarySlice.reducer;
