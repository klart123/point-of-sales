// src/screens/OrderListScreen.tsx
import React from 'react';
import {View, FlatList, Text} from 'react-native';
import styles from './styles';

const orders = [
  {id: '1', customer: 'Alice', total: 199},
  {id: '2', customer: 'Bob', total: 350},
];

const OrderListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧾 Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text>{item.customer}</Text>
            <Text>₱{item.total}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default OrderListScreen;
