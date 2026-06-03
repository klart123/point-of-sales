import {StyleSheet} from 'react-native';
import {COLORS} from '../../theme/colors';

export default StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitleSpacing: {
    paddingBottom: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
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
    borderColor: COLORS.border,
  },
  categoryDropdownText: {
    fontSize: 14,
  },
  categoryDropdownPlaceholder: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
  dropdownItem: {
    padding: 10,
  },
  addCategoryBtn: {
    padding: 10,
    marginBottom: 10,
  },
  addCategoryBtnText: {
    fontSize: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    color: COLORS.placeholder,
  },
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
    color: COLORS.text,
    lineHeight: 24,
  },

  addVariantBtn: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  addVariantText: {
    fontSize: 13,
    color: COLORS.text,
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  buttonCancel: {
    flex: 1,
    padding: 10,
    marginRight: 8,
    backgroundColor: '#FF9800',
    borderRadius: 8,
  },
  buttonAdd: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  tempDropdownWrapper: {
    flex: 1.2,
    borderRadius: 8,
    borderWidth: 0.5,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
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
