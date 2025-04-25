import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {flex: 1, padding: 20},
  title: {fontSize: 20, marginBottom: 10},

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
  total: {
    marginTop: 6,
    fontWeight: 'bold',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderNumber: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  addOnText: {
    color: '#666',
    marginLeft: 8,
  },
  addOnContainer: {
    marginTop: 4,
    paddingLeft: 15,
  },
  orerItemContainer: {
    padding: 5,
    paddingHorizontal: 10,
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
});
