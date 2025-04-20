import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store';
import {orderActions} from '../../../redux/slices/orderSlice';
import styles from '../styles';

const OrderListModal = ({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (customerName: string) => void; // Modify onSubmit to accept customer name
}) => {
  const orders = useSelector((state: RootState) => state.orders.orders);
  const dispatch = useDispatch();
  const [customerName, setCustomerName] = useState(''); // State for customer name

  // ✅ Calculate total
  const total = orders.reduce((sum, order) => sum + Number(order.price), 0);

  const handleSubmit = () => {
    if (customerName.trim() === '') {
      Alert.alert('Please enter a customer name');
      return;
    }

    // Submit the order with customer name
    onSubmit(customerName);
    onClose(); // Close modal after submit
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>🧾 Order List</Text>
            {orders.length > 0 && (
              <TouchableOpacity
                style={[styles.orderListClearBtn, styles.button]}
                onPress={() => {
                  Alert.alert(
                    'Clear Orders',
                    'Are you sure you want to clear all orders?',
                    [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'Clear',
                        style: 'destructive',
                        onPress: () => dispatch(orderActions.clearOrders()),
                      },
                    ],
                  );
                }}>
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {orders.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet.</Text>
          ) : (
            <>
              <FlatList
                data={orders}
                keyExtractor={(item, index) => item.id.toString() + index}
                renderItem={({item, index}) => (
                  <View style={styles.itemRow}>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemText}>
                        {item.name} ({item.size}) - ₱{item.price}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => dispatch(orderActions.removeOrder(index))}
                      style={styles.removeButton}>
                      <Text style={styles.removeText}>✕</Text>
                    </Pressable>
                  </View>
                )}
              />

              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>₱{total.toFixed(2)}</Text>
              </View>
            </>
          )}

          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Customer Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter customer name"
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          <View style={styles.actions}>
            <View style={{flex: 1}} />
            <Pressable style={styles.orderListButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
            <TouchableOpacity
              disabled={orders.length <= 0 || !customerName}
              style={[
                styles.orderListAddButton,
                orders.length <= 0 || !customerName
                  ? styles.buttonDisabled
                  : null,
              ]}
              onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default OrderListModal;
