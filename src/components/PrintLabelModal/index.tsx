// src/components/PrintLabelModal/index.tsx

import React, {useEffect, useState} from 'react';
import {Modal, View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {Order, OrderItem} from '../../types';
import styles from './styles';

interface Props {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onPrint: (order: Order, selectedItems: OrderItem[]) => void;
}

const PrintLabelModal: React.FC<Props> = ({
  visible,
  order,
  onClose,
  onPrint,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (visible && order) {
      // Select all items by default.
      setSelectedIds(order.items.map(item => item.id));
    }
  }, [visible, order]);

  if (!order) {
    return null;
  }

  const allSelected =
    order.items.length > 0 && selectedIds.length === order.items.length;

  const toggleItem = (itemId: number) => {
    setSelectedIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : order.items.map(item => item.id));
  };

  const handlePrint = () => {
    const selectedItems = order.items.filter(item =>
      selectedIds.includes(item.id),
    );

    if (selectedItems.length === 0) {
      return;
    }

    onPrint(order, selectedItems);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Print Labels</Text>
              <Text style={styles.subtitle}>Order #{order.order_number}</Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectAllContainer}>
            <Text style={styles.itemCount}>
              Select items ({selectedIds.length}/{order.items.length})
            </Text>

            <TouchableOpacity onPress={toggleSelectAll}>
              <Text style={styles.selectAllText}>
                {allSelected ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.itemList}
            showsVerticalScrollIndicator={false}>
            {order.items.map(item => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemRow, isSelected && styles.selectedItem]}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>

                    <Text style={styles.itemDetails}>
                      {[item.size, item.type].filter(Boolean).join(' • ')}
                    </Text>

                    {item.add_ons?.length > 0 && (
                      <Text style={styles.addOns}>
                        Add-ons:{' '}
                        {item.add_ons.map(addOn => addOn.name).join(', ')}
                      </Text>
                    )}
                  </View>

                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>
                      x{item.quantity ?? 1}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.printButton,
                selectedIds.length === 0 && styles.disabledButton,
              ]}
              disabled={selectedIds.length === 0}
              onPress={handlePrint}>
              <Text style={styles.printText}>Print ({selectedIds.length})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PrintLabelModal;
