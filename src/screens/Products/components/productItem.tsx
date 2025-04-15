import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import styles from '../styles';
import {products} from '../../../types';

const ProductItem: React.FC<products.ProductItemProps> = ({item}) => {
  return (
    <View style={styles.item}>
      <Text>{item.name}</Text>
      <Text>₱{item.price}</Text>
    </View>
  );
};

export default ProductItem;
