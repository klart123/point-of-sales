import {StyleSheet} from 'react-native';
import {COLORS} from '../../../theme';

export default StyleSheet.create({
  container: {
    paddingTop: '10%',
    padding: 24,
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
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 24,
  },
  buttonContainer: {
    paddingTop: 25,
  },
  signupContainer: {
    paddingTop: 25,
  },
  signup: {
    color: 'blue',
    textAlign: 'center',
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
