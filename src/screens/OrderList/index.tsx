import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import CancelOrderModal from './components/CancelOrderModal';
import {OrderList} from './components/orderListItem';
import HeaderComponent from '../../components/Header';
import {io} from 'socket.io-client';

let socket;

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
  const [order, setOrders] = useState([]);
  const SERVER = 'http://192.168.5.7:3000'; // Replace with your server URL

  // Function to refresh the list
  const onRefresh = () => {
    setList([]); // Clear the list to refresh
    setRefreshing(true);
    getOrdersList(); // Trigger the action to get orders again
  };

  const getOrdersList = () => {
    dispatch(services.getOrders());
  };

  useFocusEffect(
    useCallback(() => {
      getOrdersList();
      return () => {
        dispatch(services.resetOrders());
      };
    }, []),
  );

  useEffect(() => {
    // Connect and register as kitchen display
    socket = io(SERVER); // need to setup from login
    socket.emit('join', 'kitchen'); // Join the "orders" room

    // Listen for new orders pushed by server
    socket.on('new_order', order => {
      console.log('[Socket] New order:', order);
      setOrders(prev => [order, ...prev]);
    });

    // Listen for status updates
    socket.on('order_updated', updated => {
      setOrders(prev =>
        prev.map(o => (o.id === updated.id ? {...o, ...updated} : o)),
      );
    });

    // Cleanup on unmount
    return () => socket.disconnect();
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

  const updateThisItem = (orderId: any, itemId: any) => {
    dispatch(orderActions.updateOrderItemStatus({orderId, itemId}));
  };

  // Make sure renderItem returns a JSX element
  const renderItem = ({item}: {item: any}) => (
    <OrderList
      item={item}
      updateThisItem={updateThisItem}
      handleEditOrder={handleEditOrder}
      handleCompleteOrder={handleCompleteOrder}
      setModalVisible={setModalVisible}
      setSelectedOrder={setSelectedOrder}
    />
  );

  const handleHeaderPress = () => {
    navigation.navigate('Store' as never);
  };

  return (
    <>
      <HeaderComponent label="Add Order" onPress={handleHeaderPress} />
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
