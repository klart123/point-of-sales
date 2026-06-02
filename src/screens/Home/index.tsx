import React, {useEffect, useLayoutEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, Pressable} from 'react-native';
import styles from './styles';
import {HomeScreenProps, MenuItem} from './types';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useDispatch} from 'react-redux';
import * as orderServices from '../OrderList/service';

const menuItems = [
  {label: 'Orders', screen: 'Orders', style: {backgroundColor: 'red'}},
  {label: 'Summary', screen: 'OrderSummary', style: {backgroundColor: '#12a'}},
  {label: 'Products', screen: 'Products', style: {backgroundColor: '#4CAF50'}},
  {label: 'Kitchen', screen: 'Kitchen', style: {backgroundColor: '#FF9800'}},
  {
    label: 'Add Product',
    screen: 'AddProduct',
    style: {backgroundColor: '#2196F3'},
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(orderServices.getOrderStatuses());
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('Profile' as never)}
          style={{marginRight: 5}}>
          <Icon name="gear" size={24} color="#000" />
        </Pressable>
      ),
    });
  }, [navigation]);

  const renderItem = ({item}: {item: MenuItem}) => (
    <TouchableOpacity
      style={[styles.card, item.style]}
      onPress={() => navigation.navigate(item.screen as never)}>
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
      />
    </View>
  );
};

export default HomeScreen;
