import React, {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';

import {View, Text, ActivityIndicator} from 'react-native';
import {getOrderSummary} from '../../database/orderRepository';
import styles from './styles';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';

type OrderSummaryDetailsProps = NativeStackScreenProps<
  RootStackParamList,
  'OrderSummaryDetails'
>;

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

const STATUS_COLORS: Record<string, string> = {
  pending: '#fafafa',
  preparing: '#1565C0',
  ready: '#6A1B9A',
  served: '#1D9E75',
  cancelled: '#f44',
};

export default function OrderSummaryDetails({
  route,
  navigation,
}: OrderSummaryDetailsProps) {
  const {from, to} = route.params;

  const [summary, setSummary] = useState<DaySummary | null>(null);

  const [loadingSummary, setLoadingSummary] = useState(false);

  const formatted = new Date(from + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: `${formatted}`,
      });

      getOrderSummary({from, to})
        .then(res => {
          console.log(res);
          setSummary(res);
        })
        .catch(err => console.error('Failed to load summary', err))
        .finally(() => setLoadingSummary(false));
    }, []),
  );

  if (loadingSummary) {
    return (
      <View style={styles.summaryLoader}>
        <ActivityIndicator color="#1D9E75" />
      </View>
    );
  }

  if (!summary) return null;

  const {summary: s, by_status, top_products} = summary;

  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>
          ₱{s?.total_revenue?.toLocaleString()}
        </Text>
        <Text style={styles.statLabel}>Revenue</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.cashItemBox}>
          <Text style={styles.statValue}>{s?.total_orders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.cashItemBox}>
          <Text style={styles.statValue}>{s?.total_items_sold}</Text>
          <Text style={styles.statLabel}>Items Sold</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.cashStatBox}>
          <View style={styles.inStatBox}>
            <Text style={styles.statValue}>{s?.total_cash_paid?.total}</Text>
            <Text style={styles.statLabel}>Cash</Text>
          </View>
          <View style={styles.inStatBox}>
            <Text style={styles.statValue}>{s?.total_cash_paid?.count}</Text>
            <Text style={styles.statLabel}>Count</Text>
          </View>
        </View>
        <View style={styles.cashStatBox}>
          <View style={styles.inStatBox}>
            <Text style={styles.statValue}>{s?.total_gcash_paid?.total}</Text>
            <Text style={styles.statLabel}>Gcash</Text>
          </View>
          <View style={styles.inStatBox}>
            <Text style={styles.statValue}>{s?.total_gcash_paid?.count}</Text>
            <Text style={styles.statLabel}>Count</Text>
          </View>
        </View>
      </View>

      {/* Orders by status */}
      {/* <Text style={styles.sectionTitle}>Orders by Status</Text>
          <View style={styles.statusRow}>
            {by_status.map(s => (
              <View key={s.status} style={styles.statusBadgeWrapper}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: STATUS_COLORS[s.status] + '22',
                      borderColor: STATUS_COLORS[s.status],
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusCount,
                      {color: STATUS_COLORS[s.status]},
                    ]}>
                    {s.count}
                  </Text>
                  <Text
                    style={[
                      styles.statusLabel,
                      {color: STATUS_COLORS[s.status]},
                    ]}>
                    {s.status}
                  </Text>
                </View>
              </View>
            ))}
          </View> */}

      {/* Top products */}
      <Text style={styles.sectionTitle}>Top Products</Text>
      {top_products.map((p, i) => (
        <View key={`${p?.sku}-${p?.type}-${p?.size}`} style={styles.productRow}>
          <Text style={styles.productRank}>#{i + 1}</Text>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{p?.name}</Text>
            <Text style={styles.productDetail}>
              {p?.type} · {p?.size}
            </Text>
          </View>
          <View style={styles.productStats}>
            <Text style={styles.productSold}>{p?.quantity} sold</Text>
            <Text style={styles.productRevenue}>
              ₱{p?.revenue?.toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
