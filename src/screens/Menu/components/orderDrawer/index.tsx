// OrderDrawer.tsx
import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';

import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../../../redux/store';
import {orderActions} from '../../../../redux/slices/orderSlice';
import styles from './styles';
import {COLORS} from '../../../../theme';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const COLLAPSED_HEIGHT = 80;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.85;
const ANIMATION_DURATION = 300; // milliseconds

const OrderDrawer = ({
  visible,
  onClose = () => {},
  isEdit = false,
  onSubmit = () => {},
  onEdit = () => {},
}: {
  visible: boolean;
  onClose: () => void;
  isEdit: boolean;
  onSubmit: (payload: any) => void;
  onEdit: (item: any) => void;
}) => {
  const {orderCustomerName, orders} = useSelector(
    (state: RootState) => state.orders,
  );
  const dispatch = useDispatch();

  const [customerName, setCustomerName] = useState(orderCustomerName);
  const [cash, setCash] = useState('0');
  const [isGcash, setIsGcash] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');
  const totalItems = orders?.reduce(
    (sum, order) => sum + order?.items?.length,
    0,
  );
  // REANIMATED STATE
  const height = useSharedValue(COLLAPSED_HEIGHT);
  const startHeight = useSharedValue(COLLAPSED_HEIGHT);

  useEffect(() => {
    if (!visible) {
      height.value = withTiming(COLLAPSED_HEIGHT, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      });
      setExpanded(false);
    }
  }, [visible]);

  // GESTURE
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startHeight.value = expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
    })
    .onUpdate(event => {
      const nextHeight = startHeight.value - event.translationY;

      height.value = Math.max(
        COLLAPSED_HEIGHT,
        Math.min(EXPANDED_HEIGHT, nextHeight),
      );
    })
    .onEnd(event => {
      const shouldExpand =
        event.velocityY < -500 ||
        height.value > (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;

      // Smooth animation without bounce
      height.value = withTiming(
        shouldExpand ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
        {
          duration: ANIMATION_DURATION,
          easing: Easing.inOut(Easing.ease),
        },
      );
      runOnJS(setExpanded)(shouldExpand);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value + 20,
    };
  });

  // BUSINESS LOGIC
  const total = orders?.reduce((sum, order) => {
    const base = parseFloat(order?.totalPrice) || 0;
    const addOns =
      order.addOns?.reduce((s: number, a: any) => s + parseFloat(a.price), 0) ||
      0;
    return sum + base + addOns;
  }, 0);

  const change = (parseFloat(cash) || 0) - total;

  const groupItemsByVariant = (items: any[]) => {
    const map = new Map();

    items?.forEach(item => {
      const key = `${item.temp}-${item.size}`;

      if (!map.has(key)) {
        map.set(key, {
          temp: item.temp,
          size: item.size,
          quantity: 1,
          price: Number(item.price),
        });
      } else {
        const e = map.get(key);
        e.quantity += 1;
        e.price += Number(item.price);
      }
    });

    return Array.from(map.values());
  };

  const groupedOrders = useMemo(
    () =>
      orders?.map(o => ({...o, groupedItems: groupItemsByVariant(o.items)})),
    [orders],
  );

  if (!visible) return null;

  const handleSaveOrder = () => {
    height.value = withTiming(EXPANDED_HEIGHT, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.ease),
    });
    setExpanded(true);
  };

  const handleCloseDrawer = () => {
    height.value = withTiming(COLLAPSED_HEIGHT, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.ease),
    });
    setExpanded(false);
  };

  return (
    <View>
      {expanded && (
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={handleCloseDrawer}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kvWrapper}
        pointerEvents="box-none">
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.drawer, animatedStyle]}>
            {/* HANDLE */}
            <View style={styles.handleArea}>
              <View style={styles.handleBar} />

              <View
                style={[
                  styles.collapsedRow,
                  expanded
                    ? {
                        paddingBottom: 10,
                      }
                    : {
                        paddingBottom: 80,
                      },
                ]}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {totalItems} item
                    {orders?.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                <Text style={styles.totalPill}>₱{total?.toFixed(2)}</Text>

                {expanded ? (
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={handleCloseDrawer}>
                    <Text style={styles.closeBtnText}>▼ Close</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      orders?.length === 0 && styles.btnDisabled,
                    ]}
                    disabled={orders?.length === 0}
                    onPress={handleSaveOrder}>
                    <Text style={styles.saveBtnText}>
                      {isEdit ? 'Update' : 'Save'} Order
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* CONTENT */}
            <ScrollView
              style={styles.expandedScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {groupedOrders?.map((item, index) => (
                <TouchableOpacity
                  key={item.id?.toString() + index}
                  style={styles.orderRow}
                  onPress={() => onEdit(item)}>
                  <View style={styles.orderRowHead}>
                    <Text style={styles.orderName}>{item?.name}</Text>
                    <Text style={styles.orderPrice}>₱{item?.totalPrice}</Text>
                  </View>

                  {item?.groupedItems?.map((g: any, i: number) => (
                    <Text key={i} style={styles.subText}>
                      {g?.temp} {g?.size} — {g.quantity} × ₱
                      {g?.price?.toFixed(2)}
                    </Text>
                  ))}

                  {item.addOns?.length > 0 &&
                    item.addOns.map((a: any, i: number) => (
                      <Text key={i} style={styles.addOnText}>
                        + {a.name} (₱{a.price})
                      </Text>
                    ))}
                </TouchableOpacity>
              ))}

              <View style={{height: 40}} />
            </ScrollView>
            <View style={styles.expandedActions}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>₱{total?.toFixed(2)}</Text>
              </View>

              <Text style={styles.fieldLabel}>Customer name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter customer name"
                placeholderTextColor="#aaa"
                value={customerName}
                onChangeText={setCustomerName}
              />

              <Text style={styles.fieldLabel}>Cash</Text>
              <View style={styles.cashRow}>
                <TextInput
                  style={[styles.input, {flex: 1}]}
                  placeholder="0.00"
                  placeholderTextColor="#aaa"
                  keyboardType="decimal-pad"
                  value={cash}
                  onChangeText={setCash}
                />
                <TouchableOpacity
                  style={styles.exactBtn}
                  onPress={() => setCash(total?.toFixed(2))}>
                  <Text style={styles.exactBtnText}>Exact</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.changeRow}>
                <Text
                  style={[styles.changeText, change < 0 && {color: '#E24B4A'}]}>
                  Change: ₱{change?.toFixed(2)}
                </Text>

                <TouchableOpacity onPress={() => setIsGcash(p => !p)}>
                  <Text
                    style={[styles.gcashText, isGcash && styles.gcashActive]}>
                    {isGcash ? '✓ ' : ''}Paid with GCash
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Notes</Text>
              <View style={styles.cashRow}>
                <TextInput
                  style={[styles.input, {flex: 1}]}
                  placeholderTextColor={COLORS.placeholder}
                  placeholder="Notes"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() =>
                    Alert.alert('Clear Orders', 'Are you sure?', [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'Clear',
                        style: 'destructive',
                        onPress: () => dispatch(orderActions.clearOrders()),
                      },
                    ])
                  }>
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    orders?.length === 0 && styles.btnDisabled,
                  ]}
                  disabled={orders?.length === 0}
                  onPress={() => {
                    console.log('orders', orders);
                    onSubmit({
                      customer_name: customerName,
                      orders: orders,
                      cash,
                      payment_method: isGcash ? 'gcash' : 'cash',
                      notes,
                    });
                  }}>
                  <Text style={styles.submitBtnText}>
                    {isEdit ? 'Update' : 'Submit'} Order
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OrderDrawer;
