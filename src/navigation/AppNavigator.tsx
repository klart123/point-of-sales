import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import * as screens from '../index';

import {navigation} from '../types';

const Stack = createNativeStackNavigator<navigation.RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={screens.LoginScreen} />
        <Stack.Screen name="Home" component={screens.HomeScreen} />
        <Stack.Screen name="Details" component={screens.DetailsScreen} />
        <Stack.Screen name="Register" component={screens.RegisterScreen} />
        <Stack.Screen name="Orders" component={screens.OrderListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
