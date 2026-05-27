import React, {useEffect, useState} from 'react';
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
  onSubmit: (customerName: string) => void;
}) => {
  const {orderCustomerName, orders} = useSelector(
    (state: RootState) => state.orders,
  );

  console.log('orders in modal:', orders);

  const dispatch = useDispatch();
  const [customerName, setCustomerName] = useState(orderCustomerName);
  const [cash, setCash] = useState('0');

  const total = orders.reduce((sum, order) => {
    const basePrice = parseFloat(order.totalPrice) || 0;
    const addOnsTotal =
      order.addOns?.reduce((s, a) => s + parseFloat(a.price), 0) || 0;
    return sum + basePrice + addOnsTotal;
  }, 0);

  const handleSubmit = () => {
    // if (customerName.trim() === '') {
    //   Alert.alert('Please enter a customer name');
    //   return;
    // }
    onSubmit(customerName);
    onClose();
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
          <View style={{flex: 1}}>
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
                        <View style={styles.itemTextPrice}>
                          <View style={styles.itemHeadPrice}>
                            <Text style={styles.itemText}>{item.name}</Text>
                            <Text style={styles.itemText}>
                              {item.totalPrice}
                            </Text>
                          </View>

                          <FlatList
                            data={item?.items || []}
                            renderItem={({item: subItem}) => (
                              <Text style={styles.subItemText}>
                                {subItem.temp} {subItem.size} - ₱{subItem.price}
                              </Text>
                            )}
                          />
                        </View>

                        {/* Show add-ons if they exist */}
                        {item.addOns && item.addOns.length > 0 && (
                          <View style={styles.addOnContainer}>
                            {item.addOns.map((addOn, idx) => (
                              <View style={styles.itemTextPrice}>
                                <Text key={idx} style={styles.addOnText}>
                                  + {addOn.name}
                                </Text>
                                <Text style={styles.addOnText}>
                                  (₱{addOn.price})
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {item.addOns?.length > 0 && (
                          <>
                            <Text
                              style={{
                                flex: 1,
                                textAlign: 'right',
                                paddingHorizontal: 5,
                              }}>
                              {'Total + add-ons = ₱'}
                              {(
                                parseFloat(item.price) +
                                item.addOns.reduce(
                                  (s, a) => s + parseFloat(a.price),
                                  0,
                                )
                              ).toFixed(2)}
                            </Text>
                          </>
                        )}
                      </View>

                      <Pressable
                        onPress={() =>
                          dispatch(orderActions.removeOrder(index))
                        }
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
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Customer Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter customer name"
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Cash:</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <TextInput
                style={[styles.input, {flex: 1}]}
                placeholder="Cash"
                value={cash}
                onChangeText={setCash}
              />
              <TouchableOpacity
                style={[
                  styles.orderListAddButton,
                  styles.input,
                  {
                    backgroundColor: '#eee',
                    padding: 15,
                  },
                ]}
                onPress={() => setCash(total.toFixed(2))}>
                <Text>Exact Amount</Text>
              </TouchableOpacity>
            </View>
            {cash !== '0' && (
              <Text style={styles.optionLabel}>
                Change: ₱{(parseFloat(cash) - total).toFixed(2)}
              </Text>
            )}
          </View>

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
