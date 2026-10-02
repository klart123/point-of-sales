// src/store/slices/gcashSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GcashProfile} from '../../services/gcashProfileServices';

type ErrorPayload = string | Record<string, any>;

type GcashState = {
  profile: GcashProfile | null;
  loading: boolean;
  loaded: boolean;
  error: string | null | Record<string, any>;
};

const initialState: GcashState = {
  profile: null,
  loading: false,
  loaded: false,
  error: null,
};

const gcashSlice = createSlice({
  name: 'gcash',
  initialState,
  reducers: {
    gcashStart: state => {
      state.loading = true;
      state.error = null;
    },
    gcashLoadSuccess: (state, action: PayloadAction<GcashProfile | null>) => {
      state.loading = false;
      state.loaded = true;
      state.profile = action.payload;
    },
    gcashSaveSuccess: (state, action: PayloadAction<GcashProfile>) => {
      state.loading = false;
      state.profile = action.payload;
    },
    gcashClearSuccess: state => {
      state.loading = false;
      state.profile = null;
    },
    gcashFailed: (state, action: PayloadAction<ErrorPayload>) => {
      state.loading = false;
      state.loaded = true;
      state.error = action.payload;
    },
  },
});

export const {
  gcashStart,
  gcashLoadSuccess,
  gcashSaveSuccess,
  gcashClearSuccess,
  gcashFailed,
} = gcashSlice.actions;

export default gcashSlice.reducer;

// Selectors (used by GcashSettings and PayModal)
export const selectGcashProfile = (s: {gcash: GcashState}) => s?.gcash?.profile;
export const selectGcashPayload = (s: {gcash: GcashState}) =>
  s.gcash.profile?.payload ?? null;
