import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },
  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
  },
  closeButton: {
    fontSize: 22,
    color: '#777777',
    padding: 5,
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 13,
    color: '#666666',
  },
  selectAllText: {
    color: '#287A52',
    fontWeight: '600',
  },
  itemList: {
    flexGrow: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedItem: {
    borderColor: '#287A52',
    backgroundColor: '#F2FAF5',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#AAAAAA',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#287A52',
    borderColor: '#287A52',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  itemDetails: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },
  addOns: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },
  quantityBadge: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 8,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelButton: {
    flex: 1,
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
  },
  cancelText: {
    color: '#444444',
    fontWeight: '600',
  },
  printButton: {
    flex: 1,
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#287A52',
  },
  printText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.4,
  },
});

export default styles;
