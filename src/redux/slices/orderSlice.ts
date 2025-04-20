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
  ordersList: [];
  isUpdating: boolean;
  isUpdated: boolean;
}

const initialState: OrderState = {
  orders: [],
  isSubmitted: false,
  loading: false,
  error: '',
  ordersList: [],
  isUpdating: false,
  isUpdated: false,
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
    getOrderStart: state => {
      state.loading = true;
      state.ordersList = [];
    },
    getOrderSuccess: (state, action: PayloadAction<OrderItem>) => {
      state.loading = false;
      state.ordersList = action.payload;
    },
    getOrderFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.ordersList = [];
      state.error = action.payload;
    },
    updateOrderStart: state => {
      state.isUpdating = true;
      state.isUpdated = false;
    },
    updateOrderSuccess: (state, action: PayloadAction<OrderItem>) => {
      state.isUpdating = false;
      state.isUpdated = true;
    },
    updateOrderFailed: (state, action: PayloadAction<string>) => {
      state.isUpdating = false;
      state.isUpdated = false;
      state.error = action.payload;
    },
    resetOrders: state => {
      state.ordersList = [];
      state.loading = false;
      state.isUpdated = false;
      state.isUpdating = false;
    },
    resetUpdateOrder: state => {
      state.isUpdated = false;
      state.isUpdating = false;
    },
  },
});

export const orderActions = orderSlice.actions;
export default orderSlice.reducer;
