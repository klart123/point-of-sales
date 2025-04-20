import React, {useState, useEffect} from 'react';
import {Modal, View, Text, TextInput, TouchableOpacity} from 'react-native';
import styles from '../styles';
import {Picker} from '@react-native-picker/picker';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {name: string; price: string; size: string}) => void;
  // item: {name: string; price: string; size: string}; // Accepting data from main component
  item: any; // Accepting data from main component
};

const MenuModal: React.FC<Props> = ({visible, onClose, onSubmit, item}) => {
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState(item?.size || '');
  const [selectedTemp, setSelectedTemp] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');

  const handleSubmit = () => {
    onSubmit({
      id: item?.id,
      sku: item?.sku,
      name,
      price: selectedPrice,
      size: selectedSize,
    });
    handleClose(); // optional: close after submit
  };

  const handleClose = () => {
    setSelectedTemp('');
    setSelectedSize('');
    setSelectedPrice('');
    onClose();
  };

  const handleTempChange = temp => {
    setSelectedTemp(temp);
    setSelectedSize('');
    setSelectedPrice('');
  };

  const handleSizeChange = size => {
    setSelectedSize(size);
    const variant = item?.variants[selectedTemp]?.find(v => v.size === size);
    if (variant) {
      setSelectedPrice(variant.price);
    }
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
          {item?.variants && (
            <Picker
              selectedValue={selectedTemp}
              onValueChange={handleTempChange}>
              <Picker.Item label="Select Temperature" value="" />
              {Object.entries(item?.variants).map(([temp]) => (
                <Picker.Item
                  key={temp}
                  label={temp.charAt(0).toUpperCase() + temp.slice(1)}
                  value={temp}
                />
              ))}
            </Picker>
          )}

          {/* Size Picker */}
          {item?.variants && selectedTemp !== '' && (
            <Picker
              selectedValue={selectedSize}
              onValueChange={handleSizeChange}>
              <Picker.Item label="Select Size" value="" />
              {item?.variants[selectedTemp]?.map((variant, index) => (
                <Picker.Item
                  key={index}
                  label={variant.size}
                  value={variant.size}
                />
              ))}
            </Picker>
          )}

          {/* Display Price */}
          {selectedPrice !== '' && (
            <Text style={styles.selectedPrice}>Price: ₱{selectedPrice}</Text>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity onPress={handleClose} style={styles.buttonCancel}>
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
