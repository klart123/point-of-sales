import {AppDispatch} from '../redux/store'; // adjust path if needed
import * as menuSlice from '../redux/slices/menuSlice';
import axiosInstance from '../Api/axiosInstance';

export const getMenu = () => {
  return (dispatch: AppDispatch) => {
    dispatch(menuSlice.menuStart());

    axiosInstance
      .get('/products/grouped')
      .then(response => {
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

export const resetMenu = () => {
  return (dispatch: AppDispatch) => {
    dispatch(menuSlice.resetMenu());
  };
};
