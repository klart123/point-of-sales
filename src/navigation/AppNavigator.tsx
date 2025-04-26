import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as screens from '../index';
import {navigation} from '../types';
import SplashScreen from 'react-native-splash-screen';

const Stack = createNativeStackNavigator<navigation.RootStackParamList>();

const AppNavigator = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={screens.LoginScreen} />
        <Stack.Screen name="Home" component={screens.HomeScreen} />
        <Stack.Screen name="Details" component={screens.DetailsScreen} />
        <Stack.Screen name="Register" component={screens.RegisterScreen} />
        <Stack.Screen name="Orders" component={screens.OrderListScreen} />
        <Stack.Screen name="Store" component={screens.MenuScreen} />
        <Stack.Screen name="Products" component={screens.ProductScreen} />
        <Stack.Screen name="Profile" component={screens.ProfileScreen} />
        <Stack.Screen name="OrderSummary" component={screens.OrderSummary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
