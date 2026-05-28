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
import {authFetch} from '../../Api';
import axiosInstance from '../../Api/axiosInstance';

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
      .get('/orders?status=pending')
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

    return (
      <View style={[kitchenStyles.card, allDone && kitchenStyles.cardAllDone]}>
        {/* Order header */}
        <View style={kitchenStyles.cardHeader}>
          <Text style={kitchenStyles.orderNumber}>{order.order_number}</Text>
          <Text style={kitchenStyles.progress}>
            {doneCount}/{order.items.length}
          </Text>
        </View>

        {order.customer_name ? (
          <Text style={kitchenStyles.customerName}>{order.customer_name}</Text>
        ) : null}

        <Text style={kitchenStyles.timeText}>
          {new Date(order.created_at).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        {/* Item list */}
        <View style={kitchenStyles.itemList}>
          {order.items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                kitchenStyles.itemRow,
                item.status === 'done' && kitchenStyles.itemRowDone,
              ]}
              onPress={() => handleItemPress(order, item)}
              activeOpacity={0.7}>
              {/* Checkbox */}
              <View
                style={[
                  kitchenStyles.checkbox,
                  item.status === 'done' && kitchenStyles.checkboxDone,
                ]}>
                {item.status === 'done' && (
                  <Text style={kitchenStyles.checkmark}>✓</Text>
                )}
              </View>

              {/* Item info */}
              <View style={kitchenStyles.itemInfo}>
                <Text
                  style={[
                    kitchenStyles.itemName,
                    item.status === 'done' && kitchenStyles.itemNameDone,
                  ]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    kitchenStyles.itemDetail,
                    item.status === 'done' && kitchenStyles.itemDetailDone,
                  ]}>
                  {item.type} · {item.size}
                </Text>
              </View>

              {/* Quantity badge */}
              <View style={kitchenStyles.qtyBadge}>
                <Text style={kitchenStyles.qtyText}>x{item.quantity}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* All done banner */}
        {allDone && (
          <View style={kitchenStyles.readyBanner}>
            <Text style={kitchenStyles.readyText}>✓ Ready for pickup</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={kitchenStyles.container}>
      <View style={kitchenStyles.header}>
        <Text style={kitchenStyles.title}>🍳 Kitchen</Text>
        <Text style={kitchenStyles.subtitle}>
          {orders.length} active orders
        </Text>
      </View>

      {orders.length === 0 ? (
        <View style={kitchenStyles.empty}>
          <Text style={kitchenStyles.emptyText}>No active orders</Text>
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

const kitchenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1D1D1B',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
  },

  // Order card
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#F5A623', // orange — in progress
  },
  cardAllDone: {
    borderColor: '#1D9E75', // green — all done
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1B',
  },
  progress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  customerName: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 10,
  },

  // Item rows
  itemList: {
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF8EE',
  },
  itemRowDone: {
    backgroundColor: '#F0FBF7',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#1D9E75',
    borderColor: '#1D9E75',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1B',
  },
  itemNameDone: {
    color: '#aaa',
    textDecorationLine: 'line-through',
  },
  itemDetail: {
    fontSize: 11,
    color: '#888',
    textTransform: 'capitalize',
  },
  itemDetailDone: {
    color: '#bbb',
  },
  qtyBadge: {
    backgroundColor: '#1D1D1B',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Ready banner
  readyBanner: {
    marginTop: 10,
    backgroundColor: '#E1F5EE',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  readyText: {
    color: '#0F6E56',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default KitchenScreen;
