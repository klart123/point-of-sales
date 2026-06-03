// src/api/authService.ts
import axiosInstance from '../Api/axiosInstance';
import * as types from '../types';
import {AppDispatch} from '../redux/store';
import {userActions} from '../redux/slices/userSlice';

export const getUserProfile = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(userActions.getUserStart());

    axiosInstance
      .get('/user')
      .then(response => {
        if (response?.status === 200) {
          return dispatch(userActions.getUserSuccess(response?.data));
        }

        return dispatch(userActions.getUserFailed(response.data.error));
      })
      .catch(error => {
        return dispatch(userActions.getUserFailed(error.data.error));
      });
  };
};

export const resetUserProfile = () => {
  return (dispatch: AppDispatch) => {
    dispatch(userActions.resetUser());
  };
};
