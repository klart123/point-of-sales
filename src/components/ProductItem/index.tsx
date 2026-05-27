import React from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import styles from './styles';
import {products} from '../../types';

const ProductItem: React.FC<products.ProductItemProps> = ({
  item,
  onPress = () => {},
}) => {
  const {name, product_categories} = item;

  return (
    <View style={styles.item}>
      {/* <Text style={styles.itemName}>{name}</Text> */}
      <FlatList
        style={styles.productCategoriesList}
        data={product_categories}
        keyExtractor={item => item?.id.toString()}
        contentContainerStyle={{
          flex: 1,
          width: '100%',
          backgroundColor: 'yellow',
        }}
        renderItem={({item}) => (
          <View style={styles.categoryBadge}>
            <View style={styles.categoryBadgeTextContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <FlatList
              style={styles.productCategoriesList}
              data={item?.products}
              keyExtractor={item => item?.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.productItem}
                  onPress={() => onPress(item)}>
                  <Text style={styles.productItemText}>{item?.name}</Text>
                </TouchableOpacity>
              )}
              numColumns={2}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default ProductItem;
