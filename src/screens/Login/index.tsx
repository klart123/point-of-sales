import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import {navigation} from '../../types';
import {loginUser, resetLoginData} from '../../services';
import {RootState} from '../../redux/store';
import {Button, ContainerView} from '../../components';
import {COLORS} from '../../theme';
import {apiActions} from '../../redux/slices/apiSlice';
import {
  removeSocketeUrl,
  saveSocketUrl,
  removeApiBaseUrl,
  saveApiBaseUrl,
} from '../../../env';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  navigation.RootStackParamList,
  'Home'
>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {loginIsLoading, loading, isAuthenticated, error} = useSelector(
    (state: RootState) => state.auth,
  );

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    dispatch(loginUser({email, password}));
  };
  useEffect(() => {
    resetForm();
  }, []);

  useEffect(() => {
    if (!loginIsLoading && isAuthenticated) {
      // navigation.replace('Home');
      // navigation.replace('MainDrawer', {screen: 'Orders'});
      navigation.reset({index: 0, routes: [{name: 'MainDrawer'}]});
    }
  }, [loginIsLoading, isAuthenticated]);

  const handleSaveBaseUrl = async (url: string) => {
    if (url.includes('supabase.co')) {
      dispatch(apiActions.setBackendMode('supabase'));
    } else {
      if (!url.startsWith('http')) {
        Alert.alert('Invalid URL', 'Please enter a valid API URL');
        return;
      }
      dispatch(apiActions.setBackendMode('lan'));
      dispatch(apiActions.setSocketURL(url));

      await removeSocketeUrl();
      await saveSocketUrl(url);

      dispatch(apiActions.setBaseURL(`${url}/api`));
      await removeApiBaseUrl();
      await saveApiBaseUrl(url);

      Alert.alert('Success', 'API Base URL updated!');
    }
  };

  const resetForm = () => {
    dispatch(resetLoginData());
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ContainerView style={styles.container}>
        {/* <HeaderComponent icon="⚙️" onPress={() => setShowModal(true)} /> */}
        <View>
          <Text style={styles.title}>Login</Text>
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
          {error && error?.message && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error?.message}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Login"
              onPress={handleLogin}
              loading={loginIsLoading}
              disabled={loginIsLoading}
            />
          </View>

          <View style={styles.signupContainer}>
            <Text
              style={styles.signup}
              onPress={() => navigation.navigate('Register')}
              disabled={loginIsLoading}>
              Don't have an account? Register
            </Text>
          </View>
        </View>
      </ContainerView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
