// src/api/authService.ts
import axiosInstance from './axiosInstance';
import * as types from '../types';

export const registerUser = async (data: types.auth.RegisterPayload) => {
  const response = await axiosInstance.post('/register', data);
  return response.data;
};

export const loginUser = async (data: types.auth.LoginPayload) => {
  const response = await axiosInstance.post('/login', data);
  return response.data;
};
