import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axiosInstance from '../../Api/axiosInstance';
import styles from './styles';
import DateRow, {renderDateRow} from './components/OrderDateCard';

type DateSummary = {
  date: string;
  total_orders: number;
  total_revenue: number;
  served: number;
  cancelled: number;
  pending: number;
};

type DaySummary = {
  date_range: {from: string; to: string};
  summary: {
    total_orders: number;
    total_revenue: number;
    total_paid_orders: number;
    total_items_sold: number;
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
  pending: '#F5A623',
  preparing: '#1565C0',
  ready: '#6A1B9A',
  served: '#1D9E75',
  cancelled: '#f44',
};

const OrderSummary = () => {
  const [dates, setDates] = useState<DateSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDates();
  }, []);

  const loadDates = (isPullDown = false) => {
    if (isPullDown) setRefreshing(true);
    else setLoadingDates(true);

    axiosInstance
      .get('/orders/dates')
      .then(res => {
        setDates(res.data);
        // Auto-select today if available
        if (res.data.length > 0 && !selectedDate) {
          handleSelectDate(res.data[0].date);
        }
      })
      .catch(err => console.error('Failed to load dates', err))
      .finally(() => {
        setLoadingDates(false);
        setRefreshing(false);
      });
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setLoadingSummary(true);

    axiosInstance
      .get(`/orders/summary?from=${date}&to=${date}`)
      .then(res => setSummary(res.data))
      .catch(err => console.error('Failed to load summary', err))
      .finally(() => setLoadingSummary(false));
  };

  // ── Render date row ────────────────────────────────────────────────────

  // ── Render summary panel ───────────────────────────────────────────────

  const renderSummary = () => {
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
      <View style={styles.summaryPanel}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              ₱{s.total_revenue.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{s.total_orders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{s.total_items_sold}</Text>
            <Text style={styles.statLabel}>Items Sold</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{s.total_paid_orders}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
        </View>

        {/* Orders by status */}
        <Text style={styles.sectionTitle}>Orders by Status</Text>
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
        </View>

        {/* Top products */}
        <Text style={styles.sectionTitle}>Top Products</Text>
        {top_products.map((p, i) => (
          <View key={`${p.sku}-${p.type}-${p.size}`} style={styles.productRow}>
            <Text style={styles.productRank}>#{i + 1}</Text>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{p.name}</Text>
              <Text style={styles.productDetail}>
                {p.type} · {p.size}
              </Text>
            </View>
            <View style={styles.productStats}>
              <Text style={styles.productSold}>{p.total_sold} sold</Text>
              <Text style={styles.productRevenue}>
                ₱{p.total_revenue.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (loadingDates) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        ListFooterComponent={selectedDate ? renderSummary() : null}
        contentContainerStyle={{paddingBottom: 40}}
      />
    </View>
  );
};
export default OrderSummary;
