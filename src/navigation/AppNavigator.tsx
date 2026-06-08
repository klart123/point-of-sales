import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as screens from '../index';
import {navigation} from '../types';
import SplashScreen from 'react-native-splash-screen';
import {COLORS} from '../theme/colors';
import DrawerNavigator from '../components/DrawerNavigator';

const Stack = createNativeStackNavigator<navigation.RootStackParamList>();

const AppNavigator = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {backgroundColor: COLORS.primary},
          headerTitleStyle: {color: COLORS.text},
          headerTintColor: COLORS.text,
          headerBackTitle: ' ',
          headerBackButtonDisplayMode: 'minimal',
        }}>
        {/* Public screens — no drawer */}
        <Stack.Screen
          name="Login"
          component={screens.LoginScreen}
          options={{headerShown: false}} // usually login has no header
        />
        <Stack.Screen name="Register" component={screens.RegisterScreen} />
        <Stack.Screen name="Details" component={screens.DetailsScreen} />

        {/* All authenticated screens live inside the drawer */}
        <Stack.Screen
          name="MainDrawer"
          component={DrawerNavigator}
          options={{headerShown: false}} // ← drawer manages its own header
        />
        <Stack.Screen
          name="Store"
          component={screens.MenuScreen}
          options={{title: 'Menu'}}
        />
        <Stack.Screen name="AddProduct" component={screens.AddProductScreen} />
        <Stack.Screen
          name="EditProduct"
          component={screens.EditProductScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
