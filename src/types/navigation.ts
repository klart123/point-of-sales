// export type RootStackParamList = {
//   Login: undefined;
//   Home: undefined;
//   Details: {message: string};
//   Register: undefined;
//   Orders: undefined;
//   Store: undefined;
//   Products: undefined;
//   Profile: undefined;
//   OrderSummary: any;
//   Kitchen: undefined;
//   AddProduct: any;
//   EditProduct: any;
// };

import {NavigatorScreenParams} from '@react-navigation/native';

export type DrawerParamList = {
  Home: undefined;
  Orders: undefined;
  Products: undefined;
  Profile: undefined;
  OrderSummary: undefined;
  Kitchen: undefined;
  'Printer Settings': undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainDrawer: NavigatorScreenParams<DrawerParamList>;
  Details: undefined;
  Store: undefined;
  AddProduct: undefined;
  EditProduct: undefined;
  Sync: undefined;
};
