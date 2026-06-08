import {AppDispatch} from '../redux/store'; // adjust path if needed
import * as authSlice from '../redux/slices/authSlice';
import axiosInstance from '../Api/axiosInstance';
import * as authService from '../Api/authService';

export const loginUser: any = (data: {email: string; password: string}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(authSlice.loginStart());

    axiosInstance
      .post('/login', data)
      .then(response => {
        if (response?.status === 200 || response?.status === 201) {
          return dispatch(authSlice.loginSuccess(response.data));
        }
        return dispatch(authSlice.loginFailed(response.data));
      })
      .catch(error => {
        return dispatch(authSlice.loginFailed(error));
      });
  };
};
