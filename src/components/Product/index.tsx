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
      style={{
        borderRadius: 6,
        paddingBottom: 15,
      }}
      data={list}
      keyExtractor={item => item?.id.toString()}
      renderItem={({item}) => (
        <ProductItem
          key={`product_${item?.id}`}
          item={item}
          onPress={onPress}
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

export default Product;
