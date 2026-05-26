import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import styles from './styles';
import ProductItem from '../ProductItem';
import {products} from '../../types';

interface ProductProps {
  list: products.ProductItemProps[];
  refreshing: boolean;
  onRefresh: () => void;
  onPress: (item: products.ProductItemProps) => void;
}

const Product: React.FC<ProductProps> = ({
  list,
  refreshing,
  onRefresh,
  onPress = () => {},
}) => {
  return (
    <FlatList
      data={list}
      keyExtractor={item => item?.id.toString()}
      renderItem={({item}) => (
        <ProductItem item={item} onPress={() => onPress(item)} />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

export default Product;
