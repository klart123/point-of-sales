import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  // Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import {navigation} from '../../types';
import {loginUser} from '../../services';
import {RootState} from '../../redux/store';
import {
  ApiSettingsModal,
  HeaderComponent,
  Button,
  ContainerView,
} from '../../components';
import {COLORS} from '../../theme';

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
  const {loading, isAuthenticated, error} = useSelector(
    (state: RootState) => state.auth,
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    dispatch(loginUser({email, password}));
  };

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // navigation.replace('Home');
      navigation.replace('MainDrawer', {screen: 'Orders'});
    }
  }, [loading, isAuthenticated]);

  return (
    <ContainerView style={styles.container}>
      <HeaderComponent icon="⚙️" onPress={() => setShowModal(true)} />
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
        {error && error?.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error?.error}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={handleLogin} />
        </View>

        <View style={styles.signupContainer}>
          <Text
            style={styles.signup}
            onPress={() => navigation.navigate('Register')}>
            Don't have an account? Register
          </Text>
        </View>
      </View>

      <ApiSettingsModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </ContainerView>
  );
};

export default LoginScreen;
