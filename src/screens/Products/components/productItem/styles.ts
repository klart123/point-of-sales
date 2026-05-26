import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  item: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 5,
  },
  categoryBadge: {
    margin: 3,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
  },
  categoryBadgeText: {
    color: '#000',
    fontSize: 12,
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
    backgroundColor: '#f5b60a',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
});
