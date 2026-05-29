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

const SOCKET_URL = 'http://192.168.5.7:3000';

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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
      const aDone = a.items.every(i => i.status === 'done');
      const bDone = b.items.every(i => i.status === 'done');
      if (aDone === bDone) return 0;
      return aDone ? 1 : -1; // pending orders first
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadActiveOrders();
    }, []),
  );

  useEffect(() => {
    const s = io(SOCKET_URL);

    s.on('connect', () => {
      s.emit('join_room', 'kitchen');
      console.log('[Kitchen] Connected to socket');
    });

    s.on('new_order', (order: Order) => {
      setOrders(prev => [{...order, items: sortItems(order.items)}, ...prev]);
      setUpdatedAt(Date.now());
    });

    s.on('order_updated', (updated: Order) => {
      setOrders(prev => {
        if (['served', 'cancelled'].includes(updated.status)) {
          return prev.filter(o => o.id !== updated.id);
        }
        const sortedUpdated = {...updated, items: sortItems(updated.items)};
        const exists = prev.find(o => o.id === updated.id);
        if (exists) {
          return prev.map(o => (o.id === updated.id ? sortedUpdated : o));
        }
        return prev;
      });
      setUpdatedAt(Date.now());
    });

    setSocket(s);
    loadActiveOrders();

    return () => {
      s.disconnect();
    };
  }, []);

  // ── Load active orders on mount ────────────────────────────────────────

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

  // ── Mark item as done ──────────────────────────────────────────────────

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
    setRefreshing(true);
    loadActiveOrders();
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <HeaderComponent label="Add Order" onPress={handleHeaderPress} />
      <View style={styles.header}>
        <Text style={styles.title}>🍳 Kitchen</Text>
        <Text style={styles.subtitle}>{activeOrders.length} active orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active orders</Text>
        </View>
      ) : (
        <Orders
          orders={orders}
          updatedAt={updatedAt}
          onPressItem={handleItemPress}
          onCompleteOrder={handleCompleteOrder}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

export default OrderList;
