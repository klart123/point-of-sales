import axiosInstance from '../Api/axiosInstance';
import {AppDispatch} from '../redux/store';
import {orderSummaryAction} from '../redux/slices/orderSummarySlice';
import {orderActions} from '../redux/slices/orderSlice';

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

export const getSummaryDates = () => {
  return (dispatch: AppDispatch) => {
    dispatch(orderSummaryAction.getDatesStart());

    return axiosInstance
      .get('/orders/dates')
      .then(response => {
        if (response.status === 200 || response.status === 202) {
          return dispatch(orderSummaryAction.getDatesSuccess(response.data));
        }

        return dispatch(orderSummaryAction.getDatesFailed(response.statusText));
      })
      .catch(error => {
        return dispatch(
          orderSummaryAction.getDatesFailed(
            error?.response?.data?.message || 'An error Occured',
          ),
        );
      });
  };
};

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

export const getOrderStatuses: any = () => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.getStatusesStart());

    axiosInstance
      .get(`/orders/statuses`)
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          const statuses = response.data;

          // ✅ convert to map ONCE here
          const statusMap = Object.fromEntries(
            statuses.map((s: any) => [
              s.status,
              {
                priority: s.priority,
                color: s.color,
                label: s.label,
              },
            ]),
          );
          return dispatch(orderActions.getStatusesSuccess(statusMap));
        }

        return dispatch(orderActions.getStatusesFailed(response.data));
      })
      .catch(error => {
        return dispatch(orderActions.getStatusesFailed(error.data));
      });
  };
};

export const submitOrder =
  (data: {
    cash: string;
    customerName: string;
    isGcash: boolean;
    orders: any[];
  }) =>
  async (dispatch: AppDispatch) => {
    dispatch(orderActions.orderStart());

    // Each item becomes its own row — no grouping, no quantity
    const items = data.orders.flatMap(order =>
      order.items.map((item: any) => ({
        sku: order.sku,
        name: order.name,
        type: item.temp, // hot / cold / blended
        size: item.size, // 8oz / 16oz / 22oz
        price: item.price,
        quantity: 1, // always 1 per row
      })),
    );

    const payload = {
      customer_name: data.customerName || null,
      payment_method: data.isGcash ? 'gcash' : 'cash',
      items,
    };

    axiosInstance
      .post('/orders', payload)
      .then(response => {
        if (response?.status === 200 || response?.status === 201) {
          dispatch(orderActions.orderSuccess(response.data));
        }
      })
      .catch(error => {
        console.log('error', error);
        dispatch(orderActions.orderFailed(error?.data?.error));
      });
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
      .put(`/orders/${id}`, {customer_name, items})
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

export const resetEditOrder = () => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.resetEditOrder());
  };
};
