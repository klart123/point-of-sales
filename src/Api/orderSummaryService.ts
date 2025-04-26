import axiosInstance from './axiosInstance';
import * as types from '../types';
import {AppDispatch} from '../redux/store';
import {orderSummaryAction} from '../redux/slices/orderSummarySlice';

export const getOrderSummary = () => {
  return (dispatch: AppDispatch) => {
    dispatch(orderSummaryAction.getSummaryStart()); // Fixed typo here

    return axiosInstance
      .get('/orders/summary')
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          // Ensure response.data exists before dispatching
          return dispatch(orderSummaryAction.getSummarySuccess(response.data));
        }

        // Handle case when response.status is not 200 or 201
        return dispatch(
          orderSummaryAction.getSummaryFailed(
            response.data?.message || 'Unknown error',
          ),
        );
      })
      .catch(error => {
        // Safely access error data or provide a fallback message
        return dispatch(
          orderSummaryAction.getSummaryFailed(
            error?.response?.data?.message || 'An error occurred',
          ),
        );
      });
  };
};
