import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from '../styles';

interface OrderItemProps {
  orderItem: any;
  updateThisItem: () => void;
}

const OrderListItem: React.FC<OrderItemProps> = ({
  orderItem,
  updateThisItem,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.orerItemContainer,
        orderItem?.status === 'completed' && styles.completeButton,
      ]}
      onPress={updateThisItem}>
      <View style={styles.itemTextPrice}>
        <Text style={styles.itemText}>
          • {orderItem.name}{' '}
          {orderItem?.type !== 'Pastry' ? `(${orderItem.type})` : ''}
          {orderItem?.type !== 'Pastry' ? `(${orderItem.size})` : ''}
        </Text>
        <Text style={styles.textPrice}>₱{orderItem.price}</Text>
      </View>

      {orderItem.addOns && orderItem.addOns.length > 0 && (
        <View style={styles.addOnContainer}>
          {orderItem.addOns.map((addOn: any, idx: number) => (
            <View style={styles.itemTextPrice} key={idx}>
              <Text style={styles.addOnText}>+ {addOn.name}</Text>
              <Text style={styles.textPrice}>(₱{addOn.price})</Text>
            </View>
          ))}
        </View>
      )}

      {orderItem.addOns?.length > 0 && (
        <Text style={[styles.textPrice, styles.addOnPrice]}>
          {'Total + add-ons = ₱'}
          {(
            parseFloat(orderItem.price) +
            orderItem.addOns.reduce(
              (s: any, a: any) => s + parseFloat(a.price),
              0,
            )
          ).toFixed(2)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

interface OrderProps {
  item: any;
  updateThisItem: () => void;
  handleEditOrder: (item: any) => void;
  handleCompleteOrder: (item: any) => void;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedOrder: React.Dispatch<React.SetStateAction<any>>;
}

const OrderList: React.FC<OrderProps> = ({
  item,
  updateThisItem,
  handleEditOrder,
  handleCompleteOrder,
  setModalVisible,
  setSelectedOrder,
}) => {
  return (
    <View style={styles.item}>
      <View style={styles.orderNumber}>
        <Text style={styles.customerName}># {item.id}</Text>
      </View>
      <Text style={styles.customerName}>👤 {item.customer_name}</Text>
      <Text style={styles.notes}>📝 Notes: {item.notes}</Text>
      <Text style={styles.status}>📌 Status: {item.status}</Text>

      {item.items?.map((orderItem: any, index: number) => (
        <OrderListItem
          key={`item_${index}`}
          orderItem={orderItem}
          updateThisItem={() => {
            updateThisItem(item.id, orderItem.id);
          }}
        />
      ))}

      <Text style={styles.total}>💰 Total: ₱{item.total_price ?? '—'}</Text>

      {item.status !== 'completed' && (
        <View style={{gap: 15}}>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditOrder(item)}>
              <Text style={styles.buttonText}>✏️ Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.orderButton, styles.cancelButton]}
              onPress={() => {
                setModalVisible(true);
                setSelectedOrder(item?.id);
              }}>
              <Text style={styles.buttonText}>❌ Cancel Order</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={[styles.orderButton, styles.completeButton]}
              onPress={() => handleCompleteOrder(item)}>
              <Text style={styles.buttonText}>✅ Complete Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export {OrderListItem, OrderList};
