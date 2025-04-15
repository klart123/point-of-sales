import React from 'react';
import {Text, FlatList, TouchableOpacity} from 'react-native';
import styles from './styles';
import {HomeScreenProps, MenuItem} from './types';

const menuItems = [
  {label: 'Orders', screen: 'Orders', style: {backgroundColor: 'red'}},
  {label: 'Store', screen: 'Store'},
  {label: 'Products', screen: 'Products'},
];

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const renderItem = ({item}: {item: MenuItem}) => (
    <TouchableOpacity
      style={[styles.card, item.style]}
      onPress={() => navigation.navigate(item.screen as never)}>
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={menuItems}
      keyExtractor={(item, index) => index.toString()}
      numColumns={2}
      contentContainerStyle={styles.list}
      renderItem={renderItem}
    />
  );
};

export default HomeScreen;
