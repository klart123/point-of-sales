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
import {RootState} from '../../redux/store';

const OrderListScreen = () => {
  const dispatch = useDispatch();
  const {loading, ordersList, isUpdated} = useSelector(
    (state: RootState) => state.orders,
  );
  const [list, setList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Function to refresh the list
  const onRefresh = () => {
    setList([]);
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

  const renderItem = ({item}) => {
    const handleCompleteOrder = () => {
      Alert.alert(
        'Complete Order',
        'Are you sure you want to mark this order as completed?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Yes',
            onPress: () => {
              dispatch(services.completeOrder({id: item.id, status: 'served'}));
            },
          },
        ],
      );
    };

    return (
      <View style={styles.item}>
        <View style={styles.orderNumber}>
          <Text style={styles.customerName}># {item.id}</Text>
        </View>
        <Text style={styles.customerName}>👤 {item.customer_name}</Text>
        <Text style={styles.notes}>📝 Notes: {item.notes}</Text>
        <Text style={styles.status}>📌 Status: {item.status}</Text>

        {item.items?.map((orderItem, index) => (
          <Text key={index} style={styles.itemText}>
            • {orderItem.name} ({orderItem.size}) - ₱{orderItem.price}
          </Text>
        ))}

        <Text style={styles.total}>💰 Total: ₱{item.total_price ?? '—'}</Text>

        {item.status !== 'completed' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteOrder}>
            <Text style={styles.buttonText}>✅ Complete Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧾 Orders</Text>
      <FlatList
        data={list}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        // Add RefreshControl to enable pull-to-refresh
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={['#4CAF50']} // Change this to match your theme color
          />
        }
      />
    </View>
  );
};

export default OrderListScreen;
