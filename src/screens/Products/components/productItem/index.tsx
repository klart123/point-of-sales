import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import styles from './styles';
import {products} from '../../../../types';

const ProductItem: React.FC<products.ProductItemProps> = ({item}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const {name, variants, product_categories} = item;
  const handlePress = () => {
    setModalVisible(true);
  };

  return (
    <>
      <View style={styles.item} onPress={handlePress}>
        <Text>{name}</Text>
        <FlatList
          style={{flex: 1, width: '100%'}}
          data={product_categories}
          keyExtractor={item => item?.id.toString()}
          contentContainerStyle={{
            flex: 1,
            width: '100%',
            backgroundColor: 'yellow',
            padding: 10,
          }}
          renderItem={({item}) => (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.name}</Text>
              <FlatList
                style={{flex: 1, width: '100%'}}
                data={item.products}
                keyExtractor={item => item?.id.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.productItem}>
                    <Text style={styles.productText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                numColumns={2}
              />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{item.name}</Text>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Category </Text>
              <Text style={styles.modalValue}>{item.category}</Text>
            </View>

            {variants &&
              Object.entries(variants).map(([temperature, variantList]) => (
                <View key={temperature} style={styles.variantGroup}>
                  <Text style={styles.variantTitle}>
                    {temperature.toUpperCase()}
                  </Text>

                  {variantList.map((variant, index) => (
                    <Text key={index} style={styles.variantText}>
                      {variant.size} - ₱{variant.price}
                    </Text>
                  ))}
                </View>
              ))}

            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal> */}
    </>
  );
};

export default ProductItem;
