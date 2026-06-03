// components/OrderCard/index.tsx

import React from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import styles from './styles';
import axiosInstance from '../../Api/axiosInstance';
import {Order, OrderItem} from '../../types';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';

interface Props {
  order: Order;
  onPressItem: (order: Order, item: OrderItem) => void;
  onCompleteOrder: (order: Order) => void;
  hideCompleteButton: boolean;
  orderStatuses?: object;
}

const OrderCard: React.FC<Props> = ({
  order,
  onPressItem,
  onCompleteOrder,
  hideCompleteButton,
  //   orderStatuses,
}) => {
  const {orderStatuses} = useSelector((state: RootState) => state.orders);
  const allDone = order.items.every(i => i.status === 'done');
  const doneCount = order.items.filter(i => i.status === 'done').length;

  const borderColor = orderStatuses[order.status]?.color || '#000';
  return (
    <TouchableOpacity
      style={[styles.card, {borderColor: borderColor}]}
      disabled={order.status === 'completed'}
      onPress={() => {
        console.log('navigate to order', order);
      }}>
      {/* HEADER */}
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>
          {order.customer_name ? order.customer_name : order.order_number}
        </Text>

        <Text style={styles.progress}>
          {doneCount}/{order.items.length}
        </Text>
      </View>
      z
      {order.customer_name ? (
        <Text style={styles.customerName}>{order.order_number}</Text>
      ) : null}
      <Text style={styles.timeText}>
        {new Date(order.created_at).toLocaleTimeString('en-PH', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      {/* ITEMS */}
      <View style={styles.itemList}>
        {order.items.map(item => (
          <TouchableOpacity
            key={item.id}
            disabled={order.status === 'completed'}
            style={[
              styles.itemRow,
              item.status === 'done' && styles.itemRowDone,
            ]}
            onPress={() => onPressItem(order, item)}>
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

            <View style={styles.itemInfo}>
              <Text
                style={[
                  styles.itemName,
                  item.status === 'done' && styles.itemNameDone,
                ]}>
                {item.name}
              </Text>

              <View style={styles.itemDetailsRow}>
                <Text
                  style={[
                    styles.itemDetail,
                    item.status === 'done' && styles.itemDetailDone,
                  ]}>
                  {item?.type}
                </Text>
                <Text
                  style={[
                    styles.itemDetail,
                    item.status === 'done' && styles.itemDetailDone,
                  ]}>
                  {item?.size}
                </Text>
              </View>
            </View>

            <View style={styles.priceBadge}>
              <Text style={styles.qtyText}>₱{item.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {/* TOTAL */}
      {order.total_price && (
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPrice}>Total: ₱{order.total_price}</Text>
        </View>
      )}
      {/* COMPLETE BUTTON */}
      {order.status !== 'completed' && allDone && (
        <View>
          <View style={styles.readyBanner}>
            <Text style={styles.readyText}>Ready for pickup</Text>
          </View>
          {!hideCompleteButton && (
            <TouchableOpacity
              style={styles.complete}
              onPress={() => onCompleteOrder(order)}>
              <Text style={styles.readyText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default OrderCard;
