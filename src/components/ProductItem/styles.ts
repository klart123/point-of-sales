import {StyleSheet} from 'react-native';
import {COLORS} from '../../theme/colors';

export default StyleSheet.create({
  item: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: COLORS.cardSoft,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 20,
    padding: 10,
    color: COLORS.text,
  },
  productCategoriesList: {
    flex: 1,
    width: '100%',
  },
  categoryBadge: {
    margin: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
    paddingBottom: 10,
  },
  categoryBadgeTextContainer: {
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeText: {
    color: '#000',
    fontSize: 18,
    paddingBottom: 10,
  },
  categoryList: {
    marginTop: 8,
    width: '100%',
    backgroundColor: 'blue',
  },
  categoryListContent: {
    flex: 1,
    width: '100%',
  },
  productItem: {
    flex: 1,
    margin: 3,
    padding: 10,
    paddingVertical: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  productItemText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
