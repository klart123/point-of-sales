import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, Alert} from 'react-native';
import {
  HeaderComponent,
  Orders,
  ContainerView,
  PayModal,
} from '../../components';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import * as services from '../../services';
import {RootState} from '../../redux/store';
import {orderActions} from '../../redux/slices/orderSlice';
import {Order, OrderItem} from '../../types';
import styles from './styles';

// Local SQLite repository.
import {
  getOrdersFromDatabase,
  getOrderStatusesFromDatabase,
  toggleOrderItemStatus,
  updateOrderStatus,
  updateOrderPayment,
} from '../../database/orderRepository';
import {enqueueOrderForPrinting} from '../../printer/PrintQueue';

const OrderList = () => {
  const {orderStatuses} = useSelector((state: RootState) => state.orders);
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [payModal, setPayModal] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // ─────────────────────────────────────────────────────────────────────────
  // Active orders
  // ─────────────────────────────────────────────────────────────────────────

  const activeOrders = orders.filter(
    order => !['served', 'cancelled', 'completed'].includes(order.status),
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Sort order items
  // ─────────────────────────────────────────────────────────────────────────

  const sortItems = (items: OrderItem[]): OrderItem[] => {
    return [...items].sort((a, b) => {
      if (a.status === b.status) {
        return 0;
      }

      // Pending items should appear before done items.
      return a.status === 'pending' ? -1 : 1;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Sort orders
  // ─────────────────────────────────────────────────────────────────────────

  const sortOrders = (orderList: Order[]): Order[] => {
    return [...orderList].sort((a, b) => {
      // Primary: oldest order first.
      const dateDiff =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

      if (dateDiff !== 0) {
        return dateDiff;
      }

      // Tie-break: same timestamp — fall back to status priority.
      const priorityA = orderStatuses[a.status]?.priority ?? 999;
      const priorityB = orderStatuses[b.status]?.priority ?? 999;

      return priorityA - priorityB;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Load active orders from SQLite
  // ─────────────────────────────────────────────────────────────────────────

  const loadActiveOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      const today = new Date();

      // Load today's orders plus the previous two days.
      const threeDaysAgo = new Date(today);

      threeDaysAgo.setDate(today.getDate() - 2);

      const from = threeDaysAgo.toISOString().slice(0, 10);
      const to = today.toISOString().slice(0, 10);

      const localOrders = await getOrdersFromDatabase({
        status: ['preparing', 'pending', 'ready'],
        from,
        to,
      });

      console.log('localOrders', localOrders);

      // Sort items first.
      const formattedOrders = localOrders.map(order => ({
        ...order,
        items: sortItems(order.items),
      }));

      // Then sort orders.
      const sortedOrders = sortOrders(formattedOrders);

      setOrders(sortedOrders);

      // Keep Redux synchronized for the rest of the application.
      dispatch(orderActions.getOrderSuccess(sortedOrders));

      setUpdatedAt(Date.now());
    } catch (error) {
      console.error('[OrderList] Failed to load orders:', error);

      Alert.alert('Error', 'Failed to load orders from local database.');
    } finally {
      setRefreshing(false);
    }
  }, [orderStatuses, dispatch]);

  // ─────────────────────────────────────────────────────────────────────────
  // Reload whenever this screen gets focus
  // ─────────────────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      loadActiveOrders();
    }, [loadActiveOrders]),
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Load order statuses
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statuses = await getOrderStatusesFromDatabase();

        /*
         * Your existing UI expects:
         *
         * orderStatuses['pending']
         *
         * rather than:
         *
         * orderStatuses[0]
         *
         * Convert the database array into that structure.
         */
        const statusMap = statuses.reduce(
          (result: Record<string, any>, status) => {
            result[status.status] = status;
            return result;
          },
          {},
        );

        dispatch(orderActions.getStatusesSuccess(statusMap));
      } catch (error) {
        console.error('[OrderList] Failed to load statuses:', error);
      }
    };

    loadStatuses();
  }, [dispatch]);

  const handleItemPress = async (order: Order, item: OrderItem) => {
    try {
      const updatedOrder = await toggleOrderItemStatus(order.id, item.id);

      setOrders(prev =>
        prev.map(currentOrder =>
          currentOrder.id === updatedOrder.id
            ? {
                ...updatedOrder,
                items: sortItems(updatedOrder.items),
              }
            : currentOrder,
        ),
      );

      setUpdatedAt(Date.now());
    } catch (error) {
      console.error('[OrderList] Failed to update item:', error);
      Alert.alert('Error', 'Failed to update item status.');
      loadActiveOrders();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Header
  // ─────────────────────────────────────────────────────────────────────────

  const handleHeaderPress = () => {
    navigation.navigate('Store' as never);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Complete order
  // ─────────────────────────────────────────────────────────────────────────

  const handleCompleteOrder = (order: Order) => {
    const completeOrder = async () => {
      try {
        const updatedOrder = await updateOrderStatus(order.id, 'completed');

        /*
         * Completed orders are not part of activeOrders,
         * so remove it from this screen.
         */
        setOrders(prev =>
          prev.filter(currentOrder => currentOrder.id !== updatedOrder.id),
        );

        setUpdatedAt(Date.now());
      } catch (error) {
        console.error('[OrderList] Failed to complete order:', error);

        Alert.alert('Error', 'Failed to complete order.');
      }
    };

    if (order.is_paid === 0) {
      Alert.alert(
        'Order is NOT PAID',
        'Are you sure you want to mark this order as complete?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: completeOrder,
          },
        ],
      );

      return;
    }

    Alert.alert(
      'Complete Order',
      'Are you sure you want to mark this order as complete?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: completeOrder,
        },
      ],
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Pull to refresh
  // ─────────────────────────────────────────────────────────────────────────

  const onRefresh = () => {
    loadActiveOrders();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Convert order into Store edit format
  // ─────────────────────────────────────────────────────────────────────────

  const convertBackendOrder = (orderItem: any) => {
    const grouped = new Map<string, any>();

    orderItem.items.forEach((item: any) => {
      if (!grouped.has(item.sku)) {
        grouped.set(item.sku, {
          id: item.id,
          sku: item.sku,
          name: item.name,
          isUpdate: true,
          totalPrice: 0,
          items: [],
          addOns: [],
        });
      }

      const entry = grouped.get(item.sku);

      entry.items.push({
        id: item.product_item_id,
        temp: item.type ?? '',
        size: item.size ?? '',
        price: item.price ?? 0,
        quantity: item.quantity ?? 1,
        status: item.status ?? 'pending',
      });

      entry.totalPrice += (item.price ?? 0) * (item.quantity ?? 1);

      const addOns = item.add_ons_detail ?? item.add_ons ?? [];

      addOns.forEach((addOn: any) => {
        entry.addOns.push({
          name: addOn.name,
          price: addOn.price,
        });
      });
    });

    return Array.from(grouped.values());
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Edit order
  // ─────────────────────────────────────────────────────────────────────────

  const handleEditOrder = (orderItem: any) => {
    if (orderItem) {
      const converted = convertBackendOrder(orderItem);
      dispatch(orderActions.addOrderItem(orderItem));

      dispatch(orderActions.addCustomerName(orderItem.customer_name));

      dispatch(
        orderActions.editOrder({
          items: converted,
          orderId: orderItem.id,
        }),
      );
    }

    navigation.navigate('Store' as never);
  };

  const printOrder = async (data: any) => {
    // Build one entry PER PHYSICAL CUP to print. This new order shape is
    // FLAT (data.items is already the line-item array — no nested
    // order.items anymore), and it introduces a `quantity` field instead
    // of representing quantity as repeated array entries like the old
    // shape did. So a line item with quantity: 3 needs to expand into
    // 3 separate printed labels, not 1.
    const cups = (data.items ?? []).flatMap((item: any) => {
      const quantity = item.quantity ?? 1;

      const cup = {
        itemName: item.name,
        cupSize: `${item.size} (${item.type?.toUpperCase() ?? ''})`,
      };

      // Repeat this cup `quantity` times — one printed label per physical cup.
      return Array.from({length: quantity}, () => cup);
    });

    enqueueOrderForPrinting({
      orderNumber: data?.order_number ?? undefined,
      customerName: data.customer_name?.trim() || 'Guest',
      cups,
    });
  };

  const printOrderLabel = (orderItem: any) => {
    if (orderItem) {
      Alert.alert(`Print Label for order ${orderItem?.order_number}?`, '', [
        {text: 'Close', style: 'default'},
        {
          text: 'Yes',
          onPress: () => {
            printOrder(orderItem);
          },
        },
      ]);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Open payment modal
  // ─────────────────────────────────────────────────────────────────────────

  const handlePayOrder = (orderItem: Order) => {
    setSelectedOrder(orderItem);
    setPayModal(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Submit payment
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmitPayment = async (data: {
    orderId: number;
    cash_tendered?: number | null;
    isGcash?: boolean;
  }) => {
    try {
      const updatedOrder = await updateOrderPayment(data.orderId, data);

      setOrders(prev =>
        prev.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );

      setSelectedOrder(updatedOrder);

      setPayModal(false);

      setUpdatedAt(Date.now());
    } catch (error) {
      console.error('[OrderList] Failed to update payment:', error);

      Alert.alert('Payment Error', 'Failed to update payment.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <ContainerView style={styles.container}>
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
        onEditOrder={handleEditOrder}
        printOrderLabel={printOrderLabel}
        onPayOrder={handlePayOrder}
      />

      <PayModal
        visible={payModal}
        orderItem={selectedOrder}
        onClose={() => {
          setPayModal(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleSubmitPayment}
      />
    </ContainerView>
  );
};

export default OrderList;
