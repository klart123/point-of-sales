import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {},
  item: {
    flex: 1,
    margin: 3,
    padding: 10,
    paddingVertical: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  textCenter: {
    textAlign: 'center',
    padding: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  modalCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 10,
    // paddingHorizontal: 16,
  },
  addButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
    lineHeight: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonCancel: {
    padding: 10,
    marginRight: 8,
    backgroundColor: '#FF9800',
    borderRadius: 8,
  },
  buttonAdd: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
  },
  selectedPrice: {
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
  },
  orderItem: {
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00a86b',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  itemTextContainer: {
    flex: 1,
  },

  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ff4d4d',
    borderRadius: 6,
  },

  removeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  optionGroup: {
    marginBottom: 12,
  },

  optionLabel: {
    fontWeight: 'bold',
    marginBottom: 6,
  },

  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionButtonSelected: {
    backgroundColor: '#333',
    borderColor: '#333',
  },

  optionButtonText: {
    color: '#333',
  },

  optionButtonTextSelected: {
    color: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    borderColor: '#999',
  },
  orderListButton: {
    backgroundColor: '#777',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  orderListAddButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
  },
  orderListClearBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
  },
});
