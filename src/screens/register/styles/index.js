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
  errorContainer: {
    width: '100%',
    paddingVertical: 10,
    marginBottom: 10,
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
