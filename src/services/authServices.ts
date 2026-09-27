import {AppDispatch} from '../redux/store'; // adjust path if needed
import * as authSlice from '../redux/slices/authSlice';
import {supabase} from '../lib/supabase';

export const loginUser: any = (data: {email: string; password: string}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(authSlice.resetLoginData());
    dispatch(authSlice.loginStart());

    supabase.auth
      .signInWithPassword({email: data.email, password: data.password})
      .then(response => {
        const {data, error} = response;
        if (data?.user) {
          return dispatch(authSlice.loginSuccess(response.data));
        }
        if (error) {
          return dispatch(
            authSlice.loginFailed({
              message: error.message,
              code: error.code,
              status: error.status,
            }),
          );
        }
      })
      .catch(error => {
        return dispatch(authSlice.loginFailed(error));
      });
  };
};

export const registerUser: any = ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  return (dispatch: AppDispatch) => {
    dispatch(authSlice.registerStart());

    supabase.auth
      .signUp({
        email: email,
        password: password,
      })
      .then(response => {
        console.log('response', response);
        const {data, error} = response;
        if (response.data.user) {
          dispatch(authSlice.registerSuccess(data?.user));

          supabase.from('profiles').insert({
            id: data.user?.id,
            name: name,
          });
        }

        if (error) {
          console.log(error);
          dispatch(
            authSlice.registerFailure({
              message: error.message,
              code: error.code,
              status: error.status,
            }),
          );
        }
      });
  };
};

export const resetLoginData: any = () => {
  return (dispatch: AppDispatch) => {
    dispatch(authSlice.resetLoginData());
  };
};

export const resetRegistration: any = () => {
  return (dispatch: AppDispatch) => {
    dispatch(authSlice.resetRegistration());
  };
};
