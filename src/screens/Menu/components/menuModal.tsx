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
  const [selectedTemp, setSelectedTemp] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedAddOns, setSelectedAddOns] = useState<
    {name: string; price: string}[]
  >([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const base = parseFloat(selectedPrice.toString()) || 0;

    const addOnTotal =
      item?.addOns?.reduce((sum, addOn) => {
        return selectedAddOns.some(a => a.name === addOn.name)
          ? sum + parseFloat(addOn.price)
          : sum;
      }, 0) || 0;

    setTotalPrice(base + addOnTotal);
  }, [selectedPrice, selectedAddOns]);

  const handleSubmit = () => {
    onSubmit({
      id: item?.id,
      sku: item?.sku,
      name: item?.name,
      price: selectedPrice,
      size: selectedSize,
      addOns: selectedAddOns,
      totalPrice: totalPrice,
    });
    handleClose(); // optional: close after submit
  };

  const handleClose = () => {
    setSelectedTemp('');
    setSelectedSize('');
    setSelectedPrice(0);
    setSelectedAddOns([]);
    setTotalPrice(0);
    onClose();
  };

  const toggleAddOn = (addOn: {name: string; price: string}) => {
    setSelectedAddOns(prev =>
      prev.some(a => a.name === addOn.name)
        ? prev.filter(a => a.name !== addOn.name)
        : [...prev, addOn],
    );
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

          {/* Temperature Buttons */}
          {item?.variants && (
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Select Temperature:</Text>
              <View style={styles.buttonGroup}>
                {Object.entries(item.variants).map(([temp]) => (
                  <TouchableOpacity
                    key={temp}
                    style={[
                      styles.optionButton,
                      selectedTemp === temp && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      setSelectedTemp(temp);
                      setSelectedSize('');
                      setSelectedPrice('');
                    }}>
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedTemp === temp &&
                          styles.optionButtonTextSelected,
                      ]}>
                      {temp.charAt(0).toUpperCase() + temp.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Size Buttons */}
          {item?.variants && selectedTemp !== '' && (
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Select Size:</Text>
              <View style={styles.buttonGroup}>
                {item.variants[selectedTemp].map((variant, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedSize === variant.size &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      setSelectedSize(variant.size);
                      setSelectedPrice(variant.price);
                    }}>
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedSize === variant.size &&
                          styles.optionButtonTextSelected,
                      ]}>
                      {variant.size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {item?.addOns && item.addOns.length > 0 && (
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Select Add-Ons:</Text>
              <View style={styles.buttonGroup}>
                {item.addOns.map((addOn, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedAddOns.some(a => a.name === addOn.name) &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() => toggleAddOn(addOn)}>
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedAddOns.some(a => a.name === addOn.name) &&
                          styles.optionButtonTextSelected,
                      ]}>
                      {addOn.name} (+₱{addOn.price})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Display Price */}

          <Text style={styles.selectedPrice}>Price: ₱{totalPrice}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={handleClose} style={styles.buttonCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.buttonAdd,
                !selectedTemp || !selectedSize ? styles.buttonDisabled : null,
              ]}
              disabled={!selectedTemp || !selectedSize}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MenuModal;
