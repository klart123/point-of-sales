import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import styles from './styles';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../../redux/store';
import {resetRegistration} from '../../services';
import {ContainerView, Button} from '../../components';
import {COLORS} from '../../theme';
import {handleRegister} from './functions';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const RegisterScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const {registerIsLoading, userRegistered, registrationError} = useSelector(
    (state: RootState) => state.auth,
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useFocusEffect(
    useCallback(() => {
      dispatch(resetRegistration());
    }, []),
  );

  useEffect(() => {
    if (!registerIsLoading && userRegistered) {
      Alert.alert(
        'Success',
        // 'Registration successful. Check your email if email confirmation is enabled.',
        'Registratoin successful. Please redirect back to login',
        [
          {
            text: 'OK',
            onPress: () => {
              dispatch(resetRegistration());
            },
          },
        ],
      );
    }
  }, [registerIsLoading, userRegistered]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ContainerView style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor={COLORS.placeholder}
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={COLORS.placeholder}
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={COLORS.placeholder}
        />
        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor={COLORS.placeholder}
        />

        {registrationError && registrationError?.message && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{registrationError?.message}</Text>
          </View>
        )}

        <Button
          title={registerIsLoading ? 'Registering...' : 'Register'}
          onPress={() => {
            handleRegister({
              name,
              email,
              password,
              confirmPassword,
              dispatch,
            });
          }}
          loading={registerIsLoading}
          disabled={registerIsLoading}
        />
      </ContainerView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
