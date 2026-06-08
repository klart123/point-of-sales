import React, {useState, useEffect, useMemo} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import styles from '../styles';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';

type SelectedItem = {
  temp: string;
  size: string;
  price: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id: number;
    sku: string;
    name: string;
    items: SelectedItem[];
    totalPrice: number;
    isUpdate: boolean; // ← tells the parent whether to add or update
  }) => void;
  item: any;
};

const MenuModal: React.FC<Props> = ({visible, onClose, onSubmit, item}) => {
  const {orders} = useSelector((state: RootState) => state.orders);
  const [selectedAddOns, setSelectedAddOns] = useState<
    {name: string; price: string}[]
  >([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isUpdate, setIsUpdate] = useState(false);

  const {name, variant, category, items} = item || {};

  // ── Derived state ──────────────────────────────────────────────────────────

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((total, i) => total + Number(i.price), 0);
  }, [selectedItems]);

  const groupedItems = useMemo(() => {
    const map = new Map<
      string,
      {temp: string; size: string; price: number; quantity: number}
    >();
    selectedItems.forEach(i => {
      const key = `${i.temp}-${i.size}`;
      if (!map.has(key)) {
        map.set(key, {
          temp: i.temp,
          size: i.size,
          price: Number(i.price),
          quantity: 1,
        });
      } else {
        const existing = map.get(key)!;
        existing.quantity += 1;
        existing.price += Number(i.price);
      }
    });
    return Array.from(map.values());
  }, [selectedItems]);

  useEffect(() => {
    if (!visible || !item) return;

    const existingOrder = orders?.find(
      o => o.id === item.id || o.sku === item.sku,
    );

    if (existingOrder?.items?.length > 0) {
      setSelectedItems(existingOrder.items);
      setIsUpdate(true);
    } else {
      setSelectedItems([]);
      setIsUpdate(false);
    }
  }, [visible, item]);

  const handleAddItem = (
    id: number,
    temp: string,
    size: string,
    price: string,
  ) => {
    setSelectedItems(prev =>
      [...prev, {id, temp, size, price}].sort((a, b) => {
        if (a.temp < b.temp) return -1;
        if (a.temp > b.temp) return 1;
        if (a.size < b.size) return -1;
        if (a.size > b.size) return 1;
        return 0;
      }),
    );
  };

  const handleDeleteItem = (temp: string, size: string) => {
    setSelectedItems(prev => {
      const index = prev.findIndex(i => i.temp === temp && i.size === size);
      if (index === -1) return prev;
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const toggleAddOn = (addOn: {name: string; price: string}) => {
    setSelectedAddOns(prev =>
      prev.some(a => a.name === addOn.name)
        ? prev.filter(a => a.name !== addOn.name)
        : [...prev, addOn],
    );
  };

  const handleSubmit = () => {
    onSubmit({
      id: item?.id,
      sku: item?.sku,
      name: item?.name,
      items: selectedItems,
      totalPrice,
      isUpdate, // ← parent uses this to decide add vs update
    });
    handleClose();
  };

  const handleReset = () => {
    setSelectedAddOns([]);
    setIsUpdate(false);
  };

  const handleClose = () => {
    handleReset();
    setSelectedItems([]);
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onDismiss={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[styles.title, {paddingBottom: 4}]}>
            {name?.charAt(0).toUpperCase() + name?.slice(1)}
          </Text>
          {isUpdate && (
            <Text style={styles.updateBadge}>Editing existing order</Text>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 8}}
            keyboardShouldPersistTaps="handled">
            {/* Variant item buttons */}
            {category?.type !== 'pastry' && items && (
              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Select Items:</Text>
                <View style={styles.buttonGroup}>
                  <FlatList
                    data={items}
                    keyExtractor={(_, index) => index.toString()}
                    numColumns={2}
                    scrollEnabled={false}
                    style={{flex: 1, width: '100%'}}
                    renderItem={({item: variantItem, index}) => {
                      const {temperature, size, price} = variantItem;
                      return (
                        <TouchableOpacity
                          key={`temp_${temperature}_${index}`}
                          style={styles.optionButton}
                          onPress={() =>
                            handleAddItem(
                              variantItem.id,
                              temperature,
                              size,
                              price,
                            )
                          }>
                          <Text style={styles.optionButtonText}>
                            {temperature?.charAt(0)?.toUpperCase() +
                              temperature?.slice(1)}{' '}
                            {size} ₱{price}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </View>
            )}

            {/* Add-Ons */}
            {item?.addOns && item.addOns.length > 0 && (
              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Select Add-Ons:</Text>
                <View style={styles.buttonGroup}>
                  {item.addOns.map((addOn: any, index: number) => (
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

            {/* Selected items list */}
            {groupedItems.length > 0 && (
              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Order Summary:</Text>
                {groupedItems.map((groupedItem, index) => (
                  <View style={styles.displayItem} key={`selected_${index}`}>
                    <Text style={styles.selectedItems}>
                      {groupedItem.temp} - {groupedItem.size}
                    </Text>
                    <Text style={styles.selectedItems}>
                      {groupedItem.quantity} x ₱
                      {(groupedItem.price / groupedItem.quantity).toFixed(0)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteItem(groupedItem.temp, groupedItem.size)
                      }
                      style={{paddingHorizontal: 10}}>
                      <Text style={styles.removeVariantBtn}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer — fixed */}
          <View style={styles.buttons}>
            <Text style={styles.selectedPrice}>Total: ₱{totalPrice}</Text>
          </View>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={handleClose} style={styles.buttonCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.buttonAdd,
                !isUpdate && selectedItems.length === 0 && {opacity: 0.5},
              ]}
              disabled={isUpdate ? false : selectedItems.length === 0}>
              <Text style={styles.buttonText}>
                {isUpdate ? 'Update' : 'Add to Order'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MenuModal;
