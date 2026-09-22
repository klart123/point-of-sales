import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axiosInstance from '../../Api/axiosInstance';
import styles from './styles';
import DateRow from './components/OrderDateCard';
import {ContainerView} from '../../components';
import {useFocusEffect} from '@react-navigation/native';
import {getOrderDates, getOrderSummary} from '../../database/orderRepository';
import {useNavigation} from '@react-navigation/native';

type DateSummary = {
  date: string;
  total_orders: number;
  total_revenue: number;
  served: number;
  cancelled: number;
  pending: number;
};

type SummaryCash = {
  total: number;
  count: number;
};

type DaySummary = {
  date_range: {from: string; to: string};
  summary: {
    total_orders: number;
    total_revenue: number;
    total_paid_orders: number;
    total_items_sold: number;
    total_gcash_paid: SummaryCash;
    total_cash_paid: SummaryCash;
  };
  by_status: {
    status: string;
    count: number;
    orders: any[];
  }[];
  top_products: {
    name: string;
    sku: string;
    type: string;
    size: string;
    total_sold: number;
    total_revenue: number;
  }[];
};
const OrderSummary = () => {
  const [dates, setDates] = useState<DateSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      loadDates();
      setSelectedDate(null);
    }, []),
  );
  const loadDates = (isPullDown = false) => {
    if (isPullDown) {
      setDates([]);
      setRefreshing(true);
    } else {
      setDates([]);
      setLoadingDates(true);
    }

    // axiosInstance
    //   .get('/orders/dates')
    getOrderDates()
      .then(res => {
        console.log('res', res);
        setDates(res);
        // Auto-select today if available
        // if (res.length > 0 && !selectedDate) {
        //   handleSelectDate(res);
        // }
      })
      .catch(err => console.error('Failed to load dates', err))
      .finally(() => {
        setLoadingDates(false);
        setRefreshing(false);
      });
  };

  const handleSelectDate = (date: string) => {
    // setSelectedDate(date);
    // setLoadingSummary(true);

    // // axiosInstance
    // //   .get(`/orders/summary?from=${date}&to=${date}`)
    // getOrderSummary({from: date, to: date})
    //   .then(res => {
    //     console.log(res);
    //     setSummary(res);
    //   })
    //   .catch(err => console.error('Failed to load summary', err))
    //   .finally(() => setLoadingSummary(false));

    navigation.navigate('OrderSummaryDetails', {from: date, to: date});
  };

  // ── Render date row ────────────────────────────────────────────────────

  // ── Render summary panel ───────────────────────────────────────────────

  // ── Render ─────────────────────────────────────────────────────────────

  if (loadingDates) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  return (
    <ContainerView style={styles.container}>
      <FlatList
        data={dates}
        keyExtractor={item => item.date}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDates(true)}
            tintColor="#1D9E75"
            colors={['#1D9E75']}
          />
        }
        renderItem={item => {
          return (
            <DateRow
              item={item?.item}
              selectedDate={selectedDate}
              handleSelectDate={handleSelectDate}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders yet.</Text>
          </View>
        }
        // ListFooterComponent={selectedDate ? renderSummary() : null}
        contentContainerStyle={{paddingBottom: 40}}
      />
    </ContainerView>
  );
};
export default OrderSummary;
