// components/OrderListModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  TouchableOpacity,
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
  onSubmit: () => void;
}) => {
  const orders = useSelector((state: RootState) => state.orders.orders);
  const dispatch = useDispatch();

  // ✅ Calculate total
  const total = orders.reduce((sum, order) => sum + Number(order.price), 0);

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

              {/* ✅ Total Section */}
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>₱{total.toFixed(2)}</Text>
              </View>
            </>
          )}

          <View style={styles.actions}>
            <View style={{flex: 1}} />
            <Pressable style={styles.orderListButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
            <TouchableOpacity
              disabled={orders.length <= 0}
              style={[
                styles.orderListAddButton,
                orders.length <= 0 ? styles.buttonDisabled : null,
              ]}
              onPress={() => {
                Alert.alert('Submit Orders', '', [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Submit',
                    style: 'Accept',
                    onPress: onSubmit,
                  },
                ]);
              }}>
              <Text style={styles.buttonText}>Add Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default OrderListModal;
