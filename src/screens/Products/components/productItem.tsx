import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Modal, Pressable} from 'react-native';
import styles from '../styles';
import {products} from '../../../types';

const ProductItem: React.FC<products.ProductItemProps> = ({item}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity style={styles.item} onPress={handlePress}>
        <Text>{item.name}</Text>
        <Text>₱{item.price}</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{item.name}</Text>
            <Text>Price: ₱{item.price}</Text>
            <Text>Description: {item.description ?? 'No description'}</Text>

            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ProductItem;
