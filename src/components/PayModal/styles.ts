import {StyleSheet} from 'react-native';
import {COLORS} from '../../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.overlay,
    padding: 20,
  },
  modal: {
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitleSpacing: {
    paddingBottom: 16,
  },
  expandedScroll: {
    flexShrink: 1,
    paddingHorizontal: 16,
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
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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
  gcashButton: {
    borderRadius: 6,
    padding: 10,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
  },
});
