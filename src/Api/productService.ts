// src/api/authService.ts
import axiosInstance from './axiosInstance';
import * as types from '../types';

export const getProducts = async () => {
  const response = await axiosInstance.get('/products');
  return response.data;
};
