import React from 'react';
import {FlatList, RefreshControl, ViewStyle, View, Text} from 'react-native';
import {Order} from '../../types';
import OrderCard from '../OrderCard';
import styles from './styles';

interface OrderListProps {
  orders: Order[];
  updatedAt?: string | number;

  onPressItem: (order: Order, item: any) => void;
  onCompleteOrder: (order: Order) => void;

  contentContainerStyle?: ViewStyle;
  hideCompleteButton?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  orderStatuses?: object;
  onEditOrder: (orderItem: any) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  updatedAt,
  onPressItem,
  onCompleteOrder,
  contentContainerStyle,
  hideCompleteButton = false,
  refreshing,
  onRefresh,
  orderStatuses,
  onEditOrder,
}) => {
  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id.toString()}
      extraData={updatedAt}
      contentContainerStyle={[
        {
          padding: 8,
          gap: 8,
        },
        contentContainerStyle,
      ]}
      renderItem={({item}) => (
        <OrderCard
          order={item}
          onPressItem={onPressItem}
          onCompleteOrder={onCompleteOrder}
          hideCompleteButton={hideCompleteButton}
          onEditOrder={onEditOrder}
          orderStatuses={orderStatuses}
        />
      )}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No orders yet.</Text>
        </View>
      }
    />
  );
};

export default OrderList;
