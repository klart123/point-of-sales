import React, {useEffect, useState, useMemo} from 'react';
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
  onClose = () => {},
  onSubmit = () => {},
  onEdit = () => {},
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (customerName: string) => void;
  onEdit: (item: any) => void;
}) => {
  const {orderCustomerName, orders} = useSelector(
    (state: RootState) => state.orders,
  );

  const dispatch = useDispatch();
  const [customerName, setCustomerName] = useState(orderCustomerName);
  const [cash, setCash] = useState('0');
  const [isGcash, setIsGcash] = useState(false);

  const total = orders.reduce((sum, order) => {
    const basePrice = parseFloat(order.totalPrice) || 0;
    const addOnsTotal =
      order.addOns?.reduce((s, a) => s + parseFloat(a.price), 0) || 0;
    return sum + basePrice + addOnsTotal;
  }, 0);

  const groupItemsByVariant = items => {
    const map = new Map();

    items.forEach(item => {
      const key = `${item.temp}-${item.size}`;

      if (!map.has(key)) {
        map.set(key, {
          temp: item.temp,
          size: item.size,
          quantity: 1,
          price: Number(item.price),
        });
      } else {
        const existing = map.get(key);
        existing.quantity += 1;
        existing.price += Number(item.price);
      }
    });

    return Array.from(map.values());
  };

  const groupedOrders = useMemo(() => {
    return orders.map(order => ({
      ...order,
      groupedItems: groupItemsByVariant(order.items),
    }));
  }, [orders]);

  const handleSubmit = () => {
    console.log('orders to submit:', orders);
    console.log('customerName:', customerName);
    onSubmit({customerName, orders, cash, isGcash});
    // onClose();
  };

  const handleEdit = (item: any) => {
    onEdit(item);
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
                  data={groupedOrders}
                  keyExtractor={(item, index) => item.id.toString() + index}
                  renderItem={({item, index}) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.itemRow}
                      onPress={() => {
                        handleEdit(item);
                      }}>
                      <View style={styles.itemTextContainer}>
                        <View style={styles.itemTextPrice}>
                          <View style={styles.itemHeadPrice}>
                            <Text style={styles.itemText}>{item.name}</Text>
                            <Text style={styles.itemText}>
                              {item.totalPrice}
                            </Text>
                          </View>

                          <FlatList
                            data={item?.groupedItems || []}
                            renderItem={({item: subItem}) => (
                              <Text style={styles.subItemText}>
                                {subItem.temp} {subItem.size} -{' '}
                                {subItem.quantity} x ₱{subItem.price}
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
                    </TouchableOpacity>
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 5,
                justifyContent: 'space-between',
              }}>
              <Text style={styles.optionLabel}>
                Change: ₱{(parseFloat(cash) - total).toFixed(2)}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsGcash(prev => !prev);
                }}>
                <Text style={{color: isGcash ? '#00a86b' : '#555'}}>
                  {isGcash ? '✓ ' : ''}Paid with GCash
                </Text>
              </TouchableOpacity>
            </View>
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
