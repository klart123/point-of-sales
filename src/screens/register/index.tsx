import React, {useState} from 'react';
import {View, Text, TextInput, Button, Alert} from 'react-native';
import styles from './styles';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../../redux/store';
import {
  registerStart,
  registerSuccess,
  registerFailure,
} from '../../redux/slices/authSlice';
import {registerUser} from '../../Api/authService';
import {ContainerView} from '../../components';

const RegisterScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    dispatch(registerStart());

    try {
      const userData = await registerUser({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      dispatch(registerSuccess(userData)); // Assuming backend returns name & email
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      dispatch(registerFailure(error));
      if (error?.password) {
        setError(error.password[0]); // Access the first error from the array
      }
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <ContainerView style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Confirm Password"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button
        title={loading ? 'Registering...' : 'Register'}
        onPress={handleRegister}
        disabled={loading}
      />

      {errors && <Text style={{color: 'red', marginTop: 10}}>{errors}</Text>}
    </ContainerView>
  );
};

export default RegisterScreen;
