import {StyleSheet} from 'react-native';
import {COLORS} from '../../theme/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    paddingTop: 10,
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

  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
  },
  modalValue: {
    fontSize: 16,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  variantGroup: {
    marginBottom: 16,
  },
  variantTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 16,
  },
  variantText: {
    paddingLeft: 8,
    fontSize: 14,
  },

  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  tempTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tempTabActive: {
    backgroundColor: '#E1F5EE',
    borderColor: '#1D9E75',
  },
  tempTabText: {
    fontSize: 13,
    color: '#888780',
  },
  tempTabTextActive: {
    fontSize: 13,
    color: '#0F6E56',
    fontWeight: '500',
  },
  addVariantBtn: {
    borderWidth: 0.5,
    borderColor: '#D3D1C7',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  addVariantText: {
    fontSize: 13,
    color: '#888780',
  },

  // Modal title spacing
  modalTitleSpacing: {
    paddingBottom: 16,
  },

  // ScrollView content
  scrollContent: {},

  // Category row
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDropdown: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 0.7,
    overflow: 'hidden',
    padding: 10,
    marginBottom: 10,
    borderColor: '#aaa',
  },
  categoryDropdownText: {
    fontSize: 14,
  },
  categoryDropdownPlaceholder: {
    fontSize: 14,
    color: '#aaa',
  },
  addCategoryBtn: {
    padding: 10,
    marginBottom: 10,
  },
  addCategoryBtnText: {
    fontSize: 20,
  },

  // Dropdown items
  dropdownItem: {
    padding: 10,
  },

  // Variant header row
  variantHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  variantHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  variantHeaderSpacer: {
    width: 24,
  },

  // Variant row
  variantRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  variantInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeVariantBtn: {
    fontSize: 20,
    color: '#ccc',
    lineHeight: 24,
  },

  // Temperature dropdown
  tempDropdownWrapper: {
    flex: 1.2,
    borderRadius: 8,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  tempDropdown: {
    flex: 1,
  },
  tempDropdownItem: {
    padding: 10,
  },
  errorContainer: {
    width: '100%',
    paddingVertical: 20,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.textError,
    backgroundColor: COLORS.errorBg,
    padding: 5,
    borderRadius: 5,
    width: '100%',
  },
});
