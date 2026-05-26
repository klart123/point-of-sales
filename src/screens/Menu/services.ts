import {AppDispatch} from '../../redux/store'; // adjust path if needed
import * as menuSlice from '../../redux/slices/menuSlice';
import {orderActions} from '../../redux/slices/orderSlice';
import axiosInstance from '../../Api/axiosInstance';

export const getMenu = () => {
  return (dispatch: AppDispatch) => {
    dispatch(menuSlice.menuStart());

    axiosInstance
      .get('/products')
      .then(response => {
        console.log('response:', response);
        if (response?.status === 200) {
          return dispatch(menuSlice.menuSuccess(response.data));
        }

        return dispatch(menuSlice.menuFailed(response.data.error));
      })
      .catch(error => {
        return dispatch(menuSlice.menuFailed(error.data.error));
      });
  };
};

export const submitOrders = (payload: any) => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.orderStart());

    axiosInstance
      .post('/orders', payload)
      .then(response => {
        if (response?.status === 200 || response?.status === 201) {
          return dispatch(orderActions.orderSuccess(response.data));
        }

        return dispatch(orderActions.orderFailed(response.data));
      })
      .catch(error => {
        return dispatch(orderActions.orderFailed(error.data));
      });
  };
};

export const updateOrder = ({
  id,
  items,
  customer_name,
}: {
  id: number | string;
  items: any;
  customer_name: string;
}) => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.editOrderStart());
    axiosInstance
      .put(`/orders/${id}`, {items, customer_name})
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          return dispatch(orderActions.editOrderSuccess());
        }
        return dispatch(orderActions.editOrderFailed(response.data));
      })
      .catch(error => {
        return dispatch(orderActions.editOrderFailed(error.data));
      });
  };
};

export const resetMenu = () => {
  return (dispatch: AppDispatch) => {
    dispatch(menuSlice.resetMenu());
  };
};

export const resetEditOrder = () => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.resetEditOrder());
  };
};
