import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import styles from '../../styles';
import {DateSummary} from '../../types';

interface Props {
  item: DateSummary;
  selectedDate: string | null;
  handleSelectDate: (date: string) => {};
}

const DateRow: React.FC<Props> = ({item, selectedDate, handleSelectDate}) => {
  const isSelected = selectedDate === item?.date;
  const formatted = new Date(item.date + 'T00:00:00').toLocaleDateString(
    'en-PH',
    {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'},
  );

  return (
    <TouchableOpacity
      style={[styles.dateRow, isSelected && styles.dateRowSelected]}
      onPress={() => handleSelectDate(item.date)}>
      <View style={styles.dateRowLeft}>
        <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
          {formatted}
        </Text>
        <Text
          style={[
            styles.dateSubText,
            isSelected && styles.dateSubTextSelected,
          ]}>
          {item.total_orders} orders · {item.served} served · {item.cancelled}{' '}
          cancelled
        </Text>
      </View>
      <Text
        style={[styles.dateRevenue, isSelected && styles.dateRevenueSelected]}>
        ₱{item?.total_revenue?.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
};

export default DateRow;
