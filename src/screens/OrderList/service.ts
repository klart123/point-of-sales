import {AppDispatch} from '../../redux/store'; // adjust path if needed
import {orderActions} from '../../redux/slices/orderSlice';
import axiosInstance from '../../Api/axiosInstance';

export const getOrders = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(orderActions.getOrderStart());

    axiosInstance
      .get('/orders')
      .then(response => {
        if (response?.status === 200) {
          return dispatch(orderActions.getOrderSuccess(response?.data));
        }

        return dispatch(orderActions.getOrderStart(response.data.error));
      })
      .catch(error => {
        return dispatch(orderActions.getOrderStart(error.data.error));
      });
  };
};

export const updateOrderStatus = (data: any) => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.updateOrderStart());
    axiosInstance
      .put(`/orders/${data.id}/status`, {status: data.status})
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          return dispatch(orderActions.updateOrderSuccess(response.data));
        }

        return dispatch(orderActions.updateOrderFailed(response.data.message));
      })
      .catch(error => {
        return dispatch(orderActions.updateOrderFailed(error.data.message));
      });
  };
};

export const completeOrder = (data: any) => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.updateOrderStart());
    axiosInstance
      .put(`/orders/${data.id}/status`, {status: data.status})
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          return dispatch(orderActions.updateOrderSuccess(response.data));
        }

        return dispatch(orderActions.updateOrderFailed(response.data.message));
      })
      .catch(error => {
        return dispatch(orderActions.updateOrderFailed(error.data.message));
      });
  };
};

export const resetOrders = () => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.resetOrders());
  };
};

export const resetUpdateOrders = () => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.resetUpdateOrder());
  };
};
