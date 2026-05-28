import {AppDispatch} from '../../redux/store'; // adjust path if needed
import * as menuSlice from '../../redux/slices/menuSlice';
import {orderActions} from '../../redux/slices/orderSlice';
import axiosInstance from '../../Api/axiosInstance';

export const getMenu = () => {
  return (dispatch: AppDispatch) => {
    dispatch(menuSlice.menuStart());

    axiosInstance
      .get('/products/grouped')
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

// export const submitOrder =
//   (data: {
//     cash: string;
//     customerName: string;
//     isGcash: boolean;
//     orders: any[];
//   }) =>
//   async (dispatch: AppDispatch) => {
//     dispatch(orderActions.orderStart());

//     // Transform your orders array into flat order_items
//     const items = data.orders.flatMap(order => {
//       // Group items by temp+size to calculate quantity
//       const grouped = new Map<string, {count: number; price: number}>();

//       order.items.forEach((item: any) => {
//         const key = `${item.temp}-${item.size}`;
//         if (!grouped.has(key)) {
//           grouped.set(key, {count: 0, price: item.price});
//         }
//         grouped.get(key)!.count += 1;
//       });

//       // Map grouped items to order_items shape
//       return Array.from(grouped.entries()).map(([key, val]) => {
//         const [temp, size] = key.split('-');
//         return {
//           sku: order.sku,
//           name: order.name,
//           type: temp, // hot / cold / blended → type column
//           size: size, // 8oz / 16oz / 22oz → size column
//           price: val.price,
//           quantity: val.count,
//         };
//       });
//     });

//     const payload = {
//       customer_name: data.customerName || null,
//       payment_method: data.isGcash ? 'gcash' : 'cash',
//       items,
//     };

//     console.log('payload to submit:', payload);

//     axiosInstance
//       .post('/orders', payload)
//       .then(response => {
//         console.log('response', response);
//         if (response?.status === 200 || response?.status === 201) {
//           return dispatch(orderActions.orderSuccess(response.data));
//         }
//       })
//       .catch(error => {
//         console.log('error', error);
//         dispatch(orderActions.orderFailed(error.data.error));
//       });
//   };
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

    console.log('payload to submit:', payload);

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
