import React, {useState, useEffect} from 'react';
import {Modal, View, Text, TextInput, TouchableOpacity} from 'react-native';
import styles from '../styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {name: string; price: string; size: string}) => void;
  // item: {name: string; price: string; size: string}; // Accepting data from main component
  item: any; // Accepting data from main component
};

const MenuModal: React.FC<Props> = ({visible, onClose, onSubmit, item}) => {
  // Use useEffect to set initial state when `item` changes
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item?.price || '');
  const [size, setSize] = useState(item?.size || '');

  useEffect(() => {
    console.log('modal item', item);
    if (item) {
      setName(item.name);
      setPrice(item.price);
      setSize(item.size);
    }
  }, [item]);

  const handleSubmit = () => {
    onSubmit({name, price, size});
    onClose(); // optional: close after submit
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onDismiss={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[styles.title, {paddingBottom: 16}]}>
            Add {item?.name.charAt(0).toUpperCase() + item?.name.slice(1)}
          </Text>

          <TextInput
            placeholder="Price"
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <TextInput
            placeholder="Size"
            style={styles.input}
            value={size}
            onChangeText={setSize}
          />

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.buttonCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.buttonAdd}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MenuModal;
