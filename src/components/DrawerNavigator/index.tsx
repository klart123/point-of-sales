import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {TouchableOpacity} from 'react-native';
import {DrawerParamList} from '../../types/navigation';
import * as screens from '../../index';
import {COLORS} from '../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrinterSettingsScreen from '../../screens/PrinterSettingsScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Orders"
      screenOptions={({navigation}) => ({
        headerStyle: {backgroundColor: COLORS.primary},
        headerTitleStyle: {color: COLORS.text},
        headerTintColor: COLORS.text,
        // 🍔 Burger icon — replaces default drawer icon with your styled one
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{marginLeft: 16}}>
            <Ionicons name="menu" size={26} color={COLORS.text} />
          </TouchableOpacity>
        ),
        drawerPosition: 'left',
        drawerActiveBackgroundColor: COLORS.primary,
        drawerActiveTintColor: COLORS.text,
        drawerInactiveTintColor: '#555',
        drawerStyle: {width: '40%'},
      })}>
      {/* <Drawer.Screen name="Home" component={screens.HomeScreen} /> */}
      <Drawer.Screen name="Orders" component={screens.OrderListScreen} />
      <Drawer.Screen name="Products" component={screens.ProductScreen} />
      <Drawer.Screen
        name="OrderSummary"
        component={screens.OrderSummary}
        options={{title: 'Summary'}}
      />
      <Drawer.Screen name="Profile" component={screens.ProfileScreen} />
      <Drawer.Screen
        name="Printer Settings"
        component={PrinterSettingsScreen}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
