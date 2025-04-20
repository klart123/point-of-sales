// src/store/slices/orderSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface OrderItem {
  id: number;
  sku: string;
  name: string;
  price: number;
  size: string;
}

interface OrderState {
  orders: OrderItem[];
  isSubmitted: boolean;
  loading: boolean;
  error: string;
}

const initialState: OrderState = {
  orders: [],
  isSubmitted: false,
  loading: false,
  error: '',
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<OrderItem>) => {
      console.log('state orders', action.payload);
      state.orders.push(action.payload);
    },
    removeOrder: (state, action: PayloadAction<number>) => {
      state.orders.splice(action.payload, 1);
    },
    clearOrders: state => {
      state.orders = [];
    },
    orderStart: state => {
      state.loading = true;
      state.isSubmitted = false;
    },
    orderSuccess: (state, action: PayloadAction<OrderItem>) => {
      state.loading = false;
      state.isSubmitted = true;
    },
    orderFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isSubmitted = false;
      state.error = action.payload;
    },
  },
});

export const orderActions = orderSlice.actions;
export default orderSlice.reducer;
