// src/services/gcashProfileService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {validateQrPh} from '../utils/qrph';
import {pickAndDecodeQr} from '../utils/qrImageDecoder';
import {AppDispatch} from '../redux/store';
import {
  gcashLoadSuccess,
  gcashSaveSuccess,
  gcashClearSuccess,
} from '../redux/slices/gcashSlice';

const KEY = '@pos/gcash_profile';

export type GcashProfile = {
  mobile: string; // display only — NOT used to build the QR
  payload: string; // decoded text of the GCash "My QR" code
};

export const getGcashProfile = () => {
  return async (dispatch: AppDispatch) => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const jsonParsed: GcashProfile = JSON.parse(raw);
      dispatch(gcashLoadSuccess(jsonParsed));

      return jsonParsed as GcashProfile;
    } else return null;
  };
};

export const saveGcashProfile = (input: GcashProfile) => {
  return async (dispatch: AppDispatch) => {
    const payload = input.payload.trim();
    const error = validateQrPh(payload);
    if (error) throw new Error(error);

    const profile: GcashProfile = {
      mobile: input.mobile.trim() ?? `0900 000 0000`,
      payload,
    };

    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
    dispatch(gcashSaveSuccess(profile));
    return profile;
  };
};

export const removeGcashProfile = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(gcashClearSuccess());
    await AsyncStorage.removeItem(KEY);
  };
};

// Opens the photo picker and returns the QR text (null if cancelled).
// Doesn't touch the store, it only keeps the screen calling a thunk.
export const readGcashQrFromImage = () => async () => pickAndDecodeQr();
