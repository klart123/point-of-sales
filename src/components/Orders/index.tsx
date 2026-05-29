// components/OrderList/index.tsx

import React from 'react';
import {FlatList, RefreshControl, ViewStyle} from 'react-native';
import {Order} from '../../types';
import OrderCard from '../OrderCard';

interface OrderListProps {
  orders: Order[];
  updatedAt?: string | number;

  onPressItem: (order: Order, item: any) => void;
  onCompleteOrder: (order: Order) => void;

  contentContainerStyle?: ViewStyle;
  hideCompleteButton?: boolean;
  refreshing: boolean;
  onRefresh: () => void;
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
        />
      )}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
};

export default OrderList;
