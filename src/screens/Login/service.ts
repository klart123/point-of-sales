import {AppDispatch} from '../../redux/store'; // adjust path if needed
import * as authSlice from '../../redux/slices/authSlice';
import * as authService from '../../Api/authService';

export const loginUser = (data: {email: string; password: string}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(authSlice.loginStart());

    authService
      .loginUser(data)
      .then(response => {
        if (response?.status === 200 || response?.status === 201) {
          return dispatch(authSlice.loginSuccess(response.data));
        }

        return dispatch(authSlice.loginFailed(response.data.message));
      })
      .catch(error => {
        return dispatch(authSlice.loginFailed(error.message));
      });
  };
};
