import axiosInstance from '../Api/axiosInstance';
import {AppDispatch} from '../redux/store';
import {orderSummaryAction} from '../redux/slices/orderSummarySlice';
import {orderActions} from '../redux/slices/orderSlice';
import {printOrderLabel} from '../printer/PrintService';
import {
  getOrderStatusesFromDatabase as getOrderStatusesLocal,
  createOrder,
  updateOrder as updateOrderItem,
} from '../database/orderRepository';

// export const getOrderSummary = () => {
//   return (dispatch: AppDispatch) => {
//     dispatch(orderSummaryAction.getSummaryStart()); // Fixed typo here

//     return axiosInstance
//       .get('/orders/summary')
//       .then(response => {
//         if (response.status === 200 || response.status === 201) {
//           // Ensure response.data exists before dispatching
//           return dispatch(orderSummaryAction.getSummarySuccess(response.data));
//         }

//         // Handle case when response.status is not 200 or 201
//         return dispatch(
//           orderSummaryAction.getSummaryFailed(
//             response.data?.message || 'Unknown error',
//           ),
//         );
//       })
//       .catch(error => {
//         // Safely access error data or provide a fallback message
//         return dispatch(
//           orderSummaryAction.getSummaryFailed(
//             error?.response?.data?.message || 'An error occurred',
//           ),
//         );
//       });
//   };
// };

// export const getSummaryDates = () => {
//   return (dispatch: AppDispatch) => {
//     dispatch(orderSummaryAction.getDatesStart());

//     return axiosInstance
//       .get('/orders/dates')
//       .then(response => {
//         if (response.status === 200 || response.status === 202) {
//           return dispatch(orderSummaryAction.getDatesSuccess(response.data));
//         }

//         return dispatch(orderSummaryAction.getDatesFailed(response.statusText));
//       })
//       .catch(error => {
//         return dispatch(
//           orderSummaryAction.getDatesFailed(
//             error?.response?.data?.message || 'An error Occured',
//           ),
//         );
//       });
//   };
// };

// export const getOrders: any = (params: any) => {
//   return async (dispatch: AppDispatch) => {
//     dispatch(orderActions.getOrderStart());

//     axiosInstance
//       .get('/orders', params)
//       .then(response => {
//         if (response?.status === 200) {
//           return dispatch(orderActions.getOrderSuccess(response?.data));
//         }

//         return dispatch(orderActions.getOrderStart(response.data.error));
//       })
//       .catch(error => {
//         return dispatch(orderActions.getOrderStart(error.data.error));
//       });
//   };
// };

// export const updateOrderStatus = (data: any) => {
//   return (dispatch: AppDispatch) => {
//     dispatch(orderActions.updateOrderStart());
//     axiosInstance
//       .put(`/orders/${data.id}/status`, {status: data.status})
//       .then(response => {
//         if (response.status === 200 || response.status === 201) {
//           return dispatch(orderActions.updateOrderSuccess(response.data));
//         }

//         return dispatch(orderActions.updateOrderFailed(response.data.message));
//       })
//       .catch(error => {
//         return dispatch(orderActions.updateOrderFailed(error.data.message));
//       });
//   };
// };

// export const completeOrder = (data: any) => {
//   return (dispatch: AppDispatch) => {
//     dispatch(orderActions.updateOrderStart());
//     axiosInstance
//       .put(`/orders/${data.id}/status`, {status: data.status})
//       .then(response => {
//         if (response.status === 200 || response.status === 201) {
//           return dispatch(orderActions.updateOrderSuccess(response.data));
//         }

//         return dispatch(orderActions.updateOrderFailed(response.data.message));
//       })
//       .catch(error => {
//         return dispatch(orderActions.updateOrderFailed(error.data.message));
//       });
//   };
// };

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

    getOrderStatusesLocal()
      .then(response => {
        if (response) {
          console.log('Fetched order statuses:', response);
          const statuses = response;

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

        return dispatch(orderActions.getStatusesFailed(response));
      })
      .catch(error => {
        return dispatch(orderActions.getStatusesFailed(error));
      });
  };
};

export const submitOrder = (data: any) => async (dispatch: AppDispatch) => {
  dispatch(orderActions.orderStart());
  console.log('submitOrder called with data:', data);
  // axiosInstance
  //   .post('/orders', data)
  createOrder(data)
    .then(async response => {
      if (response) {
        dispatch(orderActions.orderSuccess(response));
      }
    })
    .catch(error => {
      console.log('error submission', error);
      dispatch(orderActions.orderFailed(error));
    });
};

export const updateOrder = (orderId: any, data: any) => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.editOrderStart());
    updateOrderItem(orderId, data)
      .then(response => {
        if (response) {
          return dispatch(orderActions.editOrderSuccess());
        }
        return dispatch(orderActions.editOrderFailed(response));
      })
      .catch(error => {
        return dispatch(orderActions.editOrderFailed(error));
      });
  };
};

export const resetEditOrder = () => {
  return (dispatch: AppDispatch) => {
    dispatch(orderActions.resetEditOrder());
  };
};
