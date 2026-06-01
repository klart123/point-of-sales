import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, FlatList, Alert} from 'react-native';
import {io, Socket} from 'socket.io-client';
import axiosInstance from '../../Api/axiosInstance';
import {HeaderComponent} from '../../components';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import styles from './styles';
import {renderOrderCard} from '../../components/RenderOrderCard';
import {Order, OrderItem} from './types';
import Orders from '../../components/Orders';
import {useDispatch, useSelector} from 'react-redux';
import * as services from './service';
import {RootState} from '../../redux/store';

const SOCKET_URL = 'http://192.168.5.7:3000';

const OrderList = () => {
  const {orderStatuses} = useSelector((state: RootState) => state.orders);
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const activeOrders = orders.filter(
    o => !['served', 'cancelled', 'completed'].includes(o.status),
  );

  const sortItems = (items: OrderItem[]): OrderItem[] => {
    return [...items].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === 'pending' ? -1 : 1; // pending first, done last
    });
  };

  const sortOrders = (orders: Order[]): Order[] => {
    return [...orders].sort((a, b) => {
      const priorityA = orderStatuses[a.status]?.priority ?? 999;
      const priorityB = orderStatuses[b.status]?.priority ?? 999;

      // Sort by status priority first
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Within the same status, oldest first
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadActiveOrders();
    }, []),
  );

  useEffect(() => {
    const s = io(SOCKET_URL);

    dispatch(services.getOrderStatuses() as any);

    s.on('connect', () => {
      s.emit('join_room', 'kitchen');
      console.log('[Kitchen] Connected to socket');
    });

    s.on('new_order', (order: Order) => {
      setOrders(prev =>
        // Add the new order then re-sort everything
        sortOrders([...prev, {...order, items: sortItems(order.items)}]),
      );
      setUpdatedAt(Date.now());
    });

    s.on('order_updated', (updated: Order) => {
      setOrders(prev => {
        // Remove if no longer active
        if (['served', 'cancelled', 'completed'].includes(updated.status)) {
          return prev.filter(o => o.id !== updated.id);
        }

        const sortedUpdated = {...updated, items: sortItems(updated.items)};
        const exists = prev.find(o => o.id === updated.id);

        let newList;
        if (exists) {
          // Replace the updated order in the list
          newList = prev.map(o => (o.id === updated.id ? sortedUpdated : o));
        } else {
          newList = prev;
        }

        // Re-sort the whole list after every update
        // so FIFO order is always maintained
        return sortOrders(newList);
      });
      setUpdatedAt(Date.now());
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const loadActiveOrders = async () => {
    axiosInstance
      .get('/orders')
      .then(response => {
        const sortedOrders = sortOrders(response.data);
        const sorted = sortedOrders.map((o: Order) => ({
          ...o,
          items: sortItems(o.items),
        }));
        setOrders(sorted);
        setUpdatedAt(Date.now());
      })
      .catch(error => {
        console.error('Failed to load orders', error);
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  const handleItemPress = async (order: Order, item: OrderItem) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== order.id) return o;
        const updatedItems = o.items.map(i =>
          i.id === item.id
            ? {...i, status: i.status === 'done' ? 'pending' : 'done'}
            : i,
        );
        return {
          ...o,
          items: sortItems(updatedItems), // ← sort after toggle
        };
      }),
    );
    setUpdatedAt(Date.now());

    axiosInstance
      .patch(`/orders/${order.id}/items/${item.id}/done`)
      .catch(error => {
        console.error('Failed to update item status', error);
        Alert.alert('Error', 'Failed to update item status.');
        loadActiveOrders();
      });
  };

  const handleHeaderPress = () => {
    navigation.navigate('Store' as never);
  };

  const handleCompleteOrder = (order: Order) => {
    Alert.alert(
      'Complete Order',
      'Are you sure you want to mark this order as complete?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Yes',
          onPress: () => {
            axiosInstance
              .patch(`/orders/${order.id}/status`, {
                status: 'completed',
              })
              .then(() => {
                loadActiveOrders();
                setOrders((prev: any[]) => prev.filter(o => o.id !== order.id));
              })
              .catch(error => {
                console.error('Failed to complete order', error);
                Alert.alert('Error', 'Failed to complete order.');
              });
          },
        },
      ],
    );
  };

  const onRefresh = () => {
    dispatch(services.getOrderStatuses() as any);
    setRefreshing(true);
    loadActiveOrders();
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <HeaderComponent label="Add Order" onPress={handleHeaderPress} />
      <View style={styles.header}>
        <Text style={styles.subtitle}>{activeOrders.length} active orders</Text>
      </View>

      <Orders
        orders={orders}
        updatedAt={updatedAt}
        onPressItem={handleItemPress}
        onCompleteOrder={handleCompleteOrder}
        refreshing={refreshing}
        onRefresh={onRefresh}
        orderStatuses={orderStatuses}
      />
    </View>
  );
};

export default OrderList;
