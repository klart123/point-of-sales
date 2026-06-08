import {StyleSheet} from 'react-native';
import {COLORS} from '../../../../theme';

export default StyleSheet.create({
  kvWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0.5,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  handleArea: {
    paddingBottom: 4,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  badge: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  totalPill: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  saveBtn: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  closeBtn: {
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeBtnText: {
    fontSize: 13,
    color: '#555',
  },
  expandedScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  expandedActions: {
    marginBottom: 40,
  },
  orderRow: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  orderRowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  orderPrice: {
    fontSize: 14,
    color: '#444',
  },
  subText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  addOnText: {
    fontSize: 12,
    color: '#0F6E56',
    marginTop: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#222',
    marginTop: 4,
  },
  editTotalContainer: {
    borderTopWidth: 1.5,
    borderTopColor: '#222',
  },
  editTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  cashRow: {flexDirection: 'row', gap: 8},
  exactBtn: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#f5f5f5',
  },
  exactBtnText: {
    fontSize: 13,
    color: '#555',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
  },
  gcashButton: {
    borderRadius: 6,
    padding: 10,
  },
  changeText: {
    fontSize: 13,
    color: '#1D9E75',
    fontWeight: '500',
  },
  gcashText: {
    fontSize: 12,
    color: '#888',
  },
  gcashActive: {
    backgroundColor: COLORS.active,
  },
  gcashActiveText: {
    fontWeight: '500',
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  clearBtn: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  clearBtnText: {
    fontSize: 13,
    color: '#555',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.4,
  },
});
