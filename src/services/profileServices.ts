import {AppDispatch} from '../redux/store'; // adjust path if needed
import {userActions} from '../redux/slices/userSlice';
import axiosInstance from '../Api/axiosInstance';
import * as services from './userServices';

// export const getUserProfile = () => {
//   return async (dispatch: AppDispatch) => {
//     dispatch(userActions.productStart());

//     services
//       .getUserProfile()
//       .then(response => {
//         if (response?.status === 200) {
//           return dispatch(userActions.productSuccess(response?.data));
//         }

//         return dispatch(userActions.productFailed(response.data.error));
//       })
//       .catch(error => {
//         return dispatch(userActions.productFailed(error.data.error));
//       });
//   };
// };

// export const resetUserProfile = () => {
//   return (dispatch: AppDispatch) => {
//     dispatch(userActions.resetUser());
//   };
// };
