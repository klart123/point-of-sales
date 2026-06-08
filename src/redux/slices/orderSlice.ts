// src/store/slices/orderSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {updateOrder} from '../../screens/Menu/services';

interface UpdateItemStatusPayload {
  orderId: number;
  itemId: number;
}
interface OrderItem {
  id: number;
  sku: string;
  name: string;
  price: number;
  size: string;
  totalPrice: number;
}

interface OrderState {
  orders: OrderItem[];
  isSubmitted: boolean;
  loading: boolean;
  error: string;
  ordersList: OrderItem[];
  isUpdating: boolean;
  isUpdated: boolean;
  isEdit: Boolean;
  orderId: number | null;
  orderCustomerName: string;
  cashTendered: number | null;
  isEditUpdated: boolean;
  message: string;
  isStatusesPending: boolean;
  orderStatusesError: string;
  orderStatuses: object;
  orderItem: object;
}

const initialState: OrderState = {
  orders: [],
  isSubmitted: false,
  loading: false,
  error: '',
  ordersList: [],
  isUpdating: false,
  isUpdated: false,
  isEdit: false,
  orderId: null,
  orderCustomerName: '',
  isEditUpdated: false,
  message: 'string',
  isStatusesPending: false,
  orderStatusesError: '',
  orderStatuses: [],
  cashTendered: 0,
  orderItem: {},
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<OrderItem>) => {
      state.orders.push(action.payload);
    },
    editOrder: (state, action: PayloadAction<any>) => {
      state.orders = action.payload?.items;
      state.orderId = action.payload?.orderId;
      state.isEdit = true;
    },
    updateOrder: (state, action: PayloadAction<OrderItem>) => {
      const index = state.orders.findIndex(o => o.sku === action.payload.sku);

      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    addOrderItem: (state, action: PayloadAction<any>) => {
      state.orderItem = action.payload;
    },
    removeOrder: (state, action: PayloadAction<number>) => {
      state.orders.splice(action.payload, 1);
    },
    clearOrders: state => {
      state.orders = [];
    },
    addCustomerName: (state, action: PayloadAction<string>) => {
      state.orderCustomerName = action.payload;
    },
    addCashTendered: (state, action: PayloadAction<number>) => {
      state.cashTendered = action.payload;
    },
    orderStart: state => {
      // state.loading = true;
      state.isSubmitted = false;
      state.message = '';
    },
    orderSuccess: (state, action: PayloadAction<any | object>) => {
      const {order_number} = action.payload;
      state.loading = false;
      state.isSubmitted = true;
      state.message = `Order ID: ${order_number}`;
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
    getOrderSuccess: (state, action: PayloadAction<any>) => {
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
    editOrderStart: state => {
      state.loading = true;
      state.isEditUpdated = false;
      state.isUpdated = false;
    },
    editOrderSuccess: state => {
      state.loading = false;
      state.isEditUpdated = true;
      state.isUpdated = true;
    },
    editOrderFailed: (state, action: PayloadAction<string>) => {
      state.isUpdating = false;
      state.isEditUpdated = false;
      state.isUpdated = false;
      state.error = action.payload;
    },
    editOrders: (
      state,
      action: PayloadAction<{
        id: number | null;
        customer_name: string;
        items: OrderItem[];
      }>,
    ) => {
      const {id, customer_name, items} = action.payload;

      state.isEdit = true;
      state.orderCustomerName = customer_name;
      state.orderId = id;
      state.orders = items;
    },
    updateOrderItemStatus: (
      state,
      action: PayloadAction<UpdateItemStatusPayload>,
    ) => {
      const {orderId, itemId} = action.payload;

      const order = state.ordersList?.data?.find(o => o.id === orderId);
      if (order) {
        const item = order?.items.find(i => i.id === itemId);

        if (item) {
          const currentStatus = item.status ?? 'pending';
          item.status = currentStatus === 'pending' ? 'completed' : 'pending';
        }
      }
    },
    getStatusesStart: state => {
      state.isStatusesPending = true;
    },
    getStatusesSuccess: (
      state,
      action: PayloadAction<UpdateItemStatusPayload>,
    ) => {
      state.isStatusesPending = false;
      state.orderStatuses = action.payload;
    },
    getStatusesFailed: (
      state,
      action: PayloadAction<UpdateItemStatusPayload>,
    ) => {
      state.isStatusesPending = false;
      state.orderStatusesError = action.payload;
    },
    resetEditOrder: state => {
      state.isEdit = false;
      state.orderCustomerName = '';
      state.orderId = null;
      state.orders = [];
      state.isEditUpdated = false;
      state.message = '';
      state.isSubmitted = false;
    },
  },
});

export const orderActions = orderSlice.actions;
export default orderSlice.reducer;
