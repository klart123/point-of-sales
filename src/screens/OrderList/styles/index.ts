import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {flex: 1},
  // title: {fontSize: 20, marginBottom: 10},

  item: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#444',
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  itemsContainer: {
    marginVertical: 6,
  },
  itemText: {
    fontSize: 16,
    marginLeft: 6,
  },
  itemTextPrice: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  total: {
    marginTop: 6,
    fontWeight: 'bold',
  },
  orderButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#bd3929',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // orderNumber: {
  //   alignItems: 'flex-end',
  //   justifyContent: 'flex-end',
  // },
  addOnText: {
    color: '#666',
    marginLeft: 8,
  },
  textPrice: {
    fontSize: 12,
  },
  addOnContainer: {
    marginTop: 4,
    paddingLeft: 15,
  },
  orerItemContainer: {
    flex: 1,
    gap: 10,
    padding: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  addOnPrice: {
    flex: 1,
    textAlign: 'right',
    paddingBottom: 5,
  },
  // container: {
  //   flex: 1,
  //   backgroundColor: '#F5F5F0',
  // },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1D1D1B',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
  },

  // Order card
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#F5A623', // orange — in progress
  },
  cardAllDone: {
    borderColor: '#1D9E75', // green — all done
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1B',
  },
  progress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  customerName: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 10,
  },

  // Item rows
  itemList: {
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF8EE',
  },
  itemRowDone: {
    backgroundColor: '#F0FBF7',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#1D9E75',
    borderColor: '#1D9E75',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1B',
  },
  itemNameDone: {
    color: '#aaa',
    textDecorationLine: 'line-through',
  },
  itemDetail: {
    fontSize: 11,
    color: '#888',
    textTransform: 'capitalize',
  },
  itemDetailDone: {
    color: '#bbb',
  },
  qtyBadge: {
    backgroundColor: '#1D1D1B',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Ready banner
  readyBanner: {
    marginTop: 10,
    backgroundColor: '#E1F5EE',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  readyText: {
    color: '#0F6E56',
    fontWeight: '600',
    fontSize: 13,
  },
});
