import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {navigation} from '../../types';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import {getOrderSummary} from '../../Api/orderSummaryService';

type Props = NativeStackScreenProps<
  navigation.RootStackParamList,
  'OrderSummary'
>;

const OrderSummary: React.FC<Props> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data} = useSelector((state: RootState) => state.orderSummary);
  const [orderSummaryData, setOrderSummaryData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<any>(null);

  const loadData = () => {
    dispatch(getOrderSummary());
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (data) {
      // Convert data object to an array of dates
      const formattedData = Object.keys(data).map(date => ({
        date,
        info: data[date],
      }));
      setOrderSummaryData(formattedData);
    }
  }, [data]);

  const toggleDate = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  if (!orderSummaryData.length) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orderSummaryData}
        keyExtractor={item => item.date} // Use the date as the key
        renderItem={({item: {date, info}}) => {
          return (
            <View style={styles.dateContainer}>
              <TouchableOpacity
                onPress={() => toggleDate(date)}
                style={styles.dateButton}>
                <Text style={styles.dateText}>{date}</Text>
              </TouchableOpacity>

              {selectedDate === date && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.totals}>
                    Order Count: {info.order_count}
                  </Text>
                  <Text style={styles.totals}>
                    Items Sold: {info.order_items_count}
                  </Text>
                  <Text style={styles.totals}>
                    Total Sales: ₱{info.total_served_price}
                  </Text>

                  {info.items.map((item, index) => (
                    <View key={index} style={styles.orderContainer}>
                      <Text style={styles.customerName}>
                        Customer: {item.order.customer_name} (
                        {item.order.total_price})
                      </Text>
                      {item.orderItems.map(orderItem => (
                        <View key={orderItem.id} style={styles.itemRow}>
                          <Text>
                            {orderItem.name} ({orderItem.size}) - ₱
                            {orderItem.price}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  dateContainer: {marginBottom: 16},
  dateButton: {backgroundColor: '#eee', padding: 12, borderRadius: 8},
  dateText: {fontSize: 18, fontWeight: 'bold'},
  detailsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  totals: {fontSize: 14, fontWeight: '600', marginBottom: 4},
  orderContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 8,
  },
  customerName: {fontSize: 16, fontWeight: '600', marginBottom: 4},
  itemRow: {marginLeft: 8, marginBottom: 2},
});

export default OrderSummary;
