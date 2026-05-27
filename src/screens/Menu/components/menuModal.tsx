import React, {useState, useEffect, useMemo} from 'react';
import {Modal, View, Text, TouchableOpacity, FlatList} from 'react-native';
import styles from '../styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id: number;
    sku: string;
    name: string;
    items: any[];
    totalPrice: number;
  }) => void;

  item: any;
};

const MenuModal: React.FC<Props> = ({visible, onClose, onSubmit, item}) => {
  const [selectedTemp, setSelectedTemp] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedAddOns, setSelectedAddOns] = useState<
    {name: string; price: string}[]
  >([]);

  const [selectedItems, setSelectedItems] = useState<
    {
      temp: string;
      size: string;
      price: string;
    }[]
  >([]);
  const {name, variant, category} = item || {};

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      return total + Number(item.price);
    }, 0);
  }, [selectedItems]);

  const groupedItems = useMemo(() => {
    const map = new Map();

    selectedItems.forEach(item => {
      const key = `${item.temp}-${item.size}`;

      if (!map.has(key)) {
        map.set(key, {
          temp: item.temp,
          size: item.size,
          price: Number(item.price),
          quantity: 1,
        });
      } else {
        const existing = map.get(key);
        existing.quantity += 1;
        existing.price += Number(item.price);
      }
    });

    return Array.from(map.values());
  }, [selectedItems]);

  useEffect(() => {
    if (item) {
      handleReset();
    }
    if (item?.category === 'Pastry') {
      setSelectedPrice(item.cost);
      setSelectedTemp('Pastry');
      setSelectedSize('small');
    }
  }, [visible]);

  useEffect(() => {
    if (selectedPrice) {
      const base = parseFloat(selectedPrice?.toString()) || 0;

      const addOnTotal =
        item?.addOns?.reduce((sum, addOn) => {
          return selectedAddOns.some(a => a.name === addOn.name)
            ? sum + parseFloat(addOn.price)
            : sum;
        }, 0) || 0;

      // setTotalPrice(base + addOnTotal);
    }
  }, [selectedPrice, selectedAddOns]);

  const handleSubmit = () => {
    onSubmit({
      id: item?.id,
      sku: item?.sku,
      name: item?.name,
      items: selectedItems,
      totalPrice: totalPrice,
    });
    handleClose(); // optional: close after submit
  };

  const handleReset = () => {
    setSelectedTemp('');
    setSelectedSize('');
    setSelectedPrice(0);
    setSelectedAddOns([]);
    // setTotalPrice(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
    setSelectedItems([]);
  };

  const toggleAddOn = (addOn: {name: string; price: string}) => {
    setSelectedAddOns(prev =>
      prev.some(a => a.name === addOn.name)
        ? prev.filter(a => a.name !== addOn.name)
        : [...prev, addOn],
    );
  };

  const handleDeleteItem = (temp: string, size: string) => {
    setSelectedItems(prev => {
      const index = prev.findIndex(
        item => item.temp === temp && item.size === size,
      );

      if (index === -1) return prev;

      const updated = [...prev];
      updated.splice(index, 1); // remove ONLY ONE item

      return updated;
    });
  };

  const handleAddItem = (temp: string, size: string, price: string) => {
    setSelectedItems(prev => {
      const updated = [
        ...prev,
        {
          temp,
          size,
          price,
        },
      ];

      return updated.sort((a, b) => {
        // 1. Sort by temperature first
        if (a.temp < b.temp) return -1;
        if (a.temp > b.temp) return 1;

        // 2. If same temp, sort by size
        if (a.size < b.size) return -1;
        if (a.size > b.size) return 1;

        return 0;
      });
    });
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
            Add {name?.charAt(0).toUpperCase() + name?.slice(1)}
          </Text>

          {/* Temperature Buttons */}
          {category?.type !== 'pastry' && variant && (
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Select Items:</Text>
              <View style={styles.buttonGroup}>
                <FlatList
                  data={variant.items}
                  keyExtractor={(_, index) => index.toString()}
                  numColumns={2}
                  style={{flex: 1, width: '100%'}}
                  renderItem={({item, index}) => {
                    const {temperature, size, price} = item;
                    return (
                      <TouchableOpacity
                        key={`temp_${temperature}_${index}`}
                        style={[
                          styles.optionButton,
                          selectedTemp === temperature &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() => handleAddItem(temperature, size, price)}>
                        <Text
                          style={[
                            styles.optionButtonText,
                            selectedTemp === temperature &&
                              styles.optionButtonTextSelected,
                          ]}>
                          {temperature.charAt(0).toUpperCase() +
                            temperature.slice(1) +
                            ' ' +
                            size +
                            ' ₱' +
                            price}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </View>
          )}

          {/* Size Buttons */}
          {item?.variants && selectedTemp !== '' && (
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Select Size:</Text>
              <View style={styles.buttonGroup}>
                {item?.variants[selectedTemp]?.map((variant, index) => (
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
          <View style={{flex: 1}}>
            <FlatList
              data={groupedItems}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({item, index}) => (
                <View style={styles.displayItem} key={`selected_${index}`}>
                  <Text style={styles.selectedItems}>
                    {item?.temp} - {item?.size}
                  </Text>

                  <Text style={styles.selectedItems}>
                    {item?.quantity} x ₱{item?.price}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item.temp, item.size)}
                    style={{paddingHorizontal: 10}}>
                    <Text style={styles.removeVariantBtn}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          <View style={styles.buttons}>
            <Text style={styles.selectedPrice}>Price: ₱{totalPrice}</Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={handleClose} style={styles.buttonCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={[styles.buttonAdd]}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MenuModal;
