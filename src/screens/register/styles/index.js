import {StyleSheet} from 'react-native';
import {COLORS} from '../../../theme';

export default StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: '10%',
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.text,
  },
});
