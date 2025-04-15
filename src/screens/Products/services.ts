import {AppDispatch} from '../../redux/store'; // adjust path if needed
import * as productSlice from '../../redux/slices/productSlice';
import * as productService from '../../Api/productService';
import axiosInstance from '../../Api/axiosInstance';

export const getProducts = (page: number) => {
  return async (dispatch: AppDispatch) => {
    dispatch(productSlice.productStart());

    axiosInstance
      .get('/products')
      .then(response => {
        if (response?.status === 200) {
          console.log('response service', response.data);
          return dispatch(productSlice.productSuccess(response.data));
        }

        return dispatch(productSlice.productFailed(response.data.error));
      })
      .catch(error => {
        return dispatch(productSlice.productFailed(error.data.error));
      });
  };
};
