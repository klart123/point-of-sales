import React, {useLayoutEffect} from 'react';
import {Text, FlatList, TouchableOpacity, Pressable} from 'react-native';
import styles from './styles';
import {HomeScreenProps, MenuItem} from './types';
import Icon from 'react-native-vector-icons/FontAwesome';

const menuItems = [
  {label: 'Orders', screen: 'Orders', style: {backgroundColor: 'red'}},
  {label: 'Summary', screen: 'OrderSummary', style: {backgroundColor: '#12a'}},
  {label: 'Products', screen: 'Products', style: {backgroundColor: '#4CAF50'}},
  {label: 'Kitchen', screen: 'Kitchen', style: {backgroundColor: '#FF9800'}},
];

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
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
