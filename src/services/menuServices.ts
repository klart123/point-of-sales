import {AppDispatch} from '../redux/store'; // adjust path if needed
import * as menuSlice from '../redux/slices/menuSlice';
import axiosInstance from '../Api/axiosInstance';
import {getProductsGroupedFromDatabase} from '../database/productRepository';

export const getMenu = () => {
  return (dispatch: AppDispatch) => {
    dispatch(menuSlice.menuStart());

    // axiosInstance
    //   .get('/products/grouped')
    getProductsGroupedFromDatabase()
      .then(response => {
        if (response) {
          console.log('Fetched menu from local database:', response);
          return dispatch(menuSlice.menuSuccess(response));
        }

        return dispatch(menuSlice.menuFailed(response));
      })
      .catch(error => {
        return dispatch(menuSlice.menuFailed(error));
      });
  };
};

export const resetMenu = () => {
  return (dispatch: AppDispatch) => {
    dispatch(menuSlice.resetMenu());
  };
};
