import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import styles from './styles';
import {useDispatch, useSelector} from 'react-redux';
import * as services from './service';
import {RootState, AppDispatch} from '../../redux/store';
import {orderActions} from '../../redux/slices/orderSlice';
import {useNavigation} from '@react-navigation/native';
import CancelOrderModal from './components/CancelOrderModal';

const OrderListScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, orders, ordersList, isUpdated} = useSelector(
    (state: RootState) => state.orders,
  );
  const [list, setList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigation = useNavigation();

  // Function to refresh the list
  const onRefresh = () => {
    setList([]); // Clear the list to refresh
    setRefreshing(true);
    getOrdersList(); // Trigger the action to get orders again
  };

  const getOrdersList = () => {
    dispatch(services.getOrders());
  };

  useEffect(() => {
    getOrdersList();

    return () => {
      dispatch(services.resetOrders());
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(ordersList?.data)) {
      setList(ordersList?.data);
    }
    setRefreshing(false); // Stop the refreshing animation once data is loaded
  }, [ordersList]);

  useEffect(() => {
    if (isUpdated) {
      setList(null);
      dispatch(services.resetUpdateOrders());
      getOrdersList();
    }
  }, [isUpdated]);

  const handleCompleteOrder = (item: object) => {
    Alert.alert(
      'Complete Order',
      'Are you sure you want to mark this order as completed?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Yes',
          onPress: () => {
            dispatch(
              services.updateOrderStatus({id: item?.id, status: 'served'}),
            );
          },
        },
      ],
    );
  };

  const handleEditOrder = (item: object) => {
    if (item) {
      dispatch(orderActions.editOrders(item));
      navigation.navigate('Store');
    }
  };

  const handleConfirmCancel = () => {
    dispatch(
      services.updateOrderStatus({id: selectedOrder, status: 'cancelled'}),
    );
    setModalVisible(false);
  };

  const renderItem = ({item, index}) => {
    return (
      <View style={styles.item} key={index}>
        <View style={styles.orderNumber}>
          <Text style={styles.customerName}># {item.id}</Text>
        </View>
        <Text style={styles.customerName}>👤 {item.customer_name}</Text>
        <Text style={styles.notes}>📝 Notes: {item.notes}</Text>
        <Text style={styles.status}>📌 Status: {item.status}</Text>

        {item.items?.map((orderItem, index) => (
          <View key={`item_${index}`} style={styles.orerItemContainer}>
            <View style={styles.itemTextPrice}>
              <Text style={styles.itemText}>
                • {orderItem.name}{' '}
                {orderItem?.type !== 'Pastry' ? `(${orderItem.type})` : ''}
                {orderItem?.type !== 'Pastry' ? `(${orderItem.size})` : ''}
              </Text>
              <Text style={styles.textPrice}>₱{orderItem.price}</Text>
            </View>
            {orderItem.addOns && orderItem.addOns.length > 0 && (
              <View style={styles.addOnContainer}>
                {orderItem.addOns.map((addOn, idx) => (
                  <View style={styles.itemTextPrice}>
                    <Text key={idx} style={styles.addOnText}>
                      + {addOn.name}
                    </Text>
                    <Text style={styles.textPrice}>(₱{addOn.price})</Text>
                  </View>
                ))}
              </View>
            )}

            {orderItem.addOns?.length > 0 && (
              <Text style={[styles.textPrice, styles.addOnPrice]}>
                {'Total + add-ons = ₱'}
                {(
                  parseFloat(orderItem.price) +
                  orderItem.addOns.reduce((s, a) => s + parseFloat(a.price), 0)
                ).toFixed(2)}
              </Text>
            )}
          </View>
        ))}

        <Text style={styles.total}>💰 Total: ₱{item.total_price ?? '—'}</Text>

        {item.status !== 'completed' && (
          <View style={{gap: 15}}>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditOrder(item)}>
                <Text style={styles.buttonText}>✏️ Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.orderButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(true);
                  setSelectedOrder(item?.id);
                }}>
                <Text style={styles.buttonText}>❌ Cancel Order</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                style={[styles.orderButton, styles.completeButton]}
                onPress={() => handleCompleteOrder(item)}>
                <Text style={styles.buttonText}>✅ Complete Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>🧾 Orders</Text>
        <FlatList
          data={list}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
        />
      </View>
      <CancelOrderModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)} // Correct way to handle modal close\
        onConfirm={handleConfirmCancel}
      />
    </>
  );
};

export default OrderListScreen;
