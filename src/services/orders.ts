// src/services/orders.ts — thunks now call op-sqlite instead of axios
import {createAsyncThunk} from '@reduxjs/toolkit';
import * as OrdersRepo from '../database/orders'; // doc 17
import type {OrderStatus, CreateOrderInput} from '../types';

export const getOrderStatuses = createAsyncThunk(
  'orders/getOrderStatuses',
  async (_, {rejectWithValue}) => {
    try {
      return await OrdersRepo.getOrderStatuses();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const getOrders = createAsyncThunk(
  'orders/getOrders',
  async (
    params: {status?: string; from?: string; to?: string} | undefined,
    {rejectWithValue},
  ) => {
    try {
      const status = params?.status
        ? (params.status.split(',') as OrderStatus[])
        : undefined;
      return await OrdersRepo.getOrders({
        status,
        from: params?.from,
        to: params?.to,
      });
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const toggleOrderItemDone = createAsyncThunk(
  'orders/toggleOrderItemDone',
  async (
    {orderId, itemId}: {orderId: number; itemId: number},
    {rejectWithValue},
  ) => {
    try {
      return await OrdersRepo.toggleOrderItemDone(orderId, itemId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async (
    {orderId, status}: {orderId: number; status: OrderStatus},
    {rejectWithValue},
  ) => {
    try {
      return await OrdersRepo.updateOrderStatus(orderId, status);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const payOrder = createAsyncThunk(
  'orders/payOrder',
  async (
    data: {
      orderId: number;
      cash_tendered?: number | null;
      isGcash?: boolean;
    },
    {rejectWithValue},
  ) => {
    try {
      const {orderId, ...rest} = data;
      return await OrdersRepo.updateOrderPayment(orderId, rest);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (data: CreateOrderInput, {rejectWithValue}) => {
    try {
      return await OrdersRepo.createOrder(data);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);
