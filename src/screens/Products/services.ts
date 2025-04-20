import {AppDispatch} from '../../redux/store'; // adjust path if needed
import {productActions} from '../../redux/slices/productSlice';
import axiosInstance from '../../Api/axiosInstance';

export const getProducts = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(productActions.productStart());

    axiosInstance
      .get('/products')
      .then(response => {
        if (response?.status === 200) {
          return dispatch(productActions.productSuccess(response?.data));
        }

        return dispatch(productActions.productFailed(response.data.error));
      })
      .catch(error => {
        return dispatch(productActions.productFailed(error.data.error));
      });
  };
};

export const resetProducts = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.resetProducts());
  };
};

export const addProducts = (payload: any) => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.addProductStart());
    axiosInstance
      .post('/products', payload)
      .then(response => {
        if (response?.status) {
          return dispatch(productActions.addProductSuccess(response?.data));
        }

        return dispatch(productActions.addProductFailed(response));
      })
      .catch(error => {
        dispatch(productActions.addProductFailed(error));
      });
  };
};
