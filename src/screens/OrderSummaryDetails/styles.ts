import {StyleSheet} from 'react-native';
import {COLORS} from '../../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1B',
  },
  statLabel: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 2,
    textAlign: 'center',
  },

  // Status badges
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadgeWrapper: {},
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  statusCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 10,
    marginTop: 2,
    textTransform: 'capitalize',
  },

  cashItemBox: {
    flex: 1,
    backgroundColor: '#fff',
    // backgroundColor: 'blue',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#eee',
    gap: 10,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#eee',
    marginTop: 5,
  },
  cashStatBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#eee',
    gap: 10,
  },
  ////
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#1D1D1B',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  empty: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 14,
  },

  // Date rows
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  dateRowSelected: {
    backgroundColor: '#E1F5EE',
  },
  dateRowLeft: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1B',
  },
  dateTextSelected: {
    color: '#0F6E56',
  },
  dateSubText: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
  dateSubTextSelected: {
    color: '#1D9E75',
  },
  dateRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
  },
  dateRevenueSelected: {
    color: '#0F6E56',
  },

  // Summary panel
  summaryPanel: {
    padding: 10,
    gap: 5,
  },
  summaryLoader: {
    padding: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 10,
    marginTop: 16,
  },

  inStatBox: {
    alignItems: 'center',
  },

  // Top products
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    // borderWidth: 0.5,
    borderColor: '#eee',
  },
  productRank: {
    fontSize: 13,
    fontWeight: '700',
    color: '#aaa',
    width: 28,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1B',
  },
  productDetail: {
    fontSize: 11,
    color: '#aaa',
    textTransform: 'capitalize',
    marginTop: 1,
  },
  productStats: {
    alignItems: 'flex-end',
  },
  productSold: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D9E75',
  },
  productRevenue: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
});
