import {configureStore} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistStore, persistReducer} from 'redux-persist';
import {combineReducers} from 'redux';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import menuSlice from './slices/menuSlice';
import orderSlice from './slices/orderSlice';
import apiSlice from './slices/apiSlice';
import userSlice from './slices/userSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'api'], // only persist auth
};

const rootReducer = combineReducers({
  api: apiSlice,
  auth: authReducer,
  products: productReducer,
  menu: menuSlice,
  orders: orderSlice,
  user: userSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
