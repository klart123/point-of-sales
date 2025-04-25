// src/redux/slices/apiSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface userState {
  user: object | null;
  loading: boolean;
  error: string | object | null;
}

const initialState: userState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getUserStart: state => {
      state.loading = true;
      state.user = null;
    },
    getUserSuccess: (state, action: PayloadAction<object | null>) => {
      state.loading = false;
      state.user = action.payload;
    },
    getUserFailed: (state, action: PayloadAction<string | object | null>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetUser: state => {
      state.loading = false;
      state.user = null;
      state.error = '';
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
