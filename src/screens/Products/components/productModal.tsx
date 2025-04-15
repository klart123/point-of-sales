import React, {useState} from 'react';
import {Modal, View, Text, TextInput, TouchableOpacity} from 'react-native';
import styles from '../styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {name: string; price: string; size: string}) => void;
};

const ProductModal: React.FC<Props> = ({visible, onClose, onSubmit}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');

  const handleSubmit = () => {
    onSubmit({name, price, size});
    onClose(); // optional: close after submit
    setName('');
    setPrice('');
    setSize('');
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
          <Text style={[styles.title, {paddingBottom: 16}]}>Add Product</Text>

          <TextInput
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
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
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProductModal;
