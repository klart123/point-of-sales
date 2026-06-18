// src/redux/slices/apiSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ApiState {
  baseURL: string;
  socketURL: string;
  loading: boolean;
  error: string | null;
  backendMode: string;
}

const initialState: ApiState = {
  baseURL: '', // Initially empty, to be set later
  socketURL: '',
  loading: false,
  error: null,
  backendMode: '',
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setBaseURL: (state, action: PayloadAction<string>) => {
      state.baseURL = action.payload; // Update baseURL in state
    },
    setSocketURL: (state, action: PayloadAction<string>) => {
      state.socketURL = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload; // Update loading state
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload; // Update error state
    },
    setBackendMode: (state, action: PayloadAction<string>) => {
      state.backendMode = action.payload;
    },
  },
});

export const apiActions = apiSlice.actions;
export default apiSlice.reducer;
