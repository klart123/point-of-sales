// src/redux/slices/apiSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ApiState {
  baseURL: string;
  loading: boolean;
  error: string | null;
}

const initialState: ApiState = {
  baseURL: '', // Initially empty, to be set later
  loading: false,
  error: null,
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setBaseURL: (state, action: PayloadAction<string>) => {
      state.baseURL = action.payload; // Update baseURL in state
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload; // Update loading state
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload; // Update error state
    },
  },
});

export const apiActions = apiSlice.actions;
export default apiSlice.reducer;
