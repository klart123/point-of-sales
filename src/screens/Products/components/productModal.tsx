import React, {useState} from 'react';
import {Modal, View, Text, TextInput, TouchableOpacity} from 'react-native';
import styles from '../styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    price: string;
    size: string;
    description: string;
    category: string;
  }) => void;
};

const ProductModal: React.FC<Props> = ({visible, onClose, onSubmit}) => {
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    onSubmit({name, price, description, category});
    // onClose(); // optional: close after submit
    // setName('');
    // setPrice('');
    // setSize('');
    // setDescription('');
    // setCategory('');
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
            placeholder="Description"
            style={styles.input}
            keyboardType="numeric"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            placeholder="Price"
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <TextInput
            placeholder="Category"
            style={styles.input}
            keyboardType="numeric"
            value={category}
            onChangeText={setCategory}
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
