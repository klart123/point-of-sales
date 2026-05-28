import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {io, Socket} from 'socket.io-client';
import axiosInstance from '../../Api/axiosInstance';
import styles from './styles';

const SOCKET_URL = 'http://192.168.5.7:3000';

type OrderItem = {
  id: number;
  sku: string;
  name: string;
  type: string;
  size: string;
  price: number;
  quantity: number;
  status: 'pending' | 'done';
};

type Order = {
  id: number;
  order_number: string;
  customer_name: string | null;
  status: string;
  created_at: string;
  items: OrderItem[];
};

const KitchenScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);

  // ── Socket connection ──────────────────────────────────────────────────

  const sortItems = (items: OrderItem[]): OrderItem[] => {
    return [...items].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === 'pending' ? -1 : 1; // pending first, done last
    });
  };

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
      .get('/orders', {params: {status: 'pending,preparing'}})
      .then(response => {
        const sorted = response.data.map((o: Order) => ({
          ...o,
          items: sortItems(o.items),
        }));
        setOrders(sorted);
        setUpdatedAt(Date.now());
      })
      .catch(error => {
        console.error('Failed to load orders', error);
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

  // ── Render ─────────────────────────────────────────────────────────────

  const renderOrderCard = ({item: order}: {item: Order}) => {
    const allDone = order.items.every(i => i.status === 'done');
    const doneCount = order.items.filter(i => i.status === 'done').length;
    console.log('order', order);
    return (
      <View style={[styles.card, allDone && styles.cardAllDone]}>
        {/* Order header */}
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <Text style={styles.progress}>
            {doneCount}/{order.items.length}
          </Text>
        </View>

        {order.customer_name ? (
          <Text style={styles.customerName}>{order.customer_name}</Text>
        ) : null}

        <Text style={styles.timeText}>
          {new Date(order.created_at).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        {/* Item list */}
        <View style={styles.itemList}>
          {order.items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemRow,
                item.status === 'done' && styles.itemRowDone,
              ]}
              onPress={() => handleItemPress(order, item)}
              activeOpacity={0.7}>
              {/* Checkbox */}

              <View
                style={[
                  styles.checkbox,
                  item.status === 'done' && styles.checkboxDone,
                ]}>
                {item.status === 'done' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>x{item.quantity}</Text>
              </View>
              {/* Item info */}
              <View style={styles.itemInfo}>
                <Text
                  style={[
                    styles.itemName,
                    item.status === 'done' && styles.itemNameDone,
                  ]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.itemDetail,
                    item.status === 'done' && styles.itemDetailDone,
                  ]}>
                  {item.type} · {item.size}
                </Text>
              </View>

              {/* Quantity badge */}

              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View>
          {order?.total_price && (
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPrice}>
                Total: ₱{order?.total_price}
              </Text>
            </View>
          )}
        </View>

        {/* All done banner */}
        {allDone && (
          <View>
            <View style={styles.readyBanner}>
              <Text style={styles.readyText}>Ready for pickup</Text>
            </View>
            <View style={styles.complete}>
              <Text style={styles.readyText}>Complete</Text>
            </View>
          </View>
        )}
      </View>
    );
  };
  ``;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍳 Kitchen</Text>
        <Text style={styles.subtitle}>{orders.length} active orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active orders</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id.toString()}
          renderItem={renderOrderCard}
          extraData={updatedAt} // ← forces FlatList to re-render when this changes
          //   numColumns={2}
          contentContainerStyle={{padding: 8, gap: 8}}
          //   columnWrapperStyle={{gap: 8}}
        />
      )}
    </View>
  );
};

export default KitchenScreen;
