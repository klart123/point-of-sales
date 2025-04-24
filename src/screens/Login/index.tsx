import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import {navigation} from '../../types';
import {loginUser} from './service';
import {RootState} from '../../redux/store';
import ApiSettingsModal from '../../components/ApiSettingsModal';

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
  const {loading, isAuthenticated} = useSelector(
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
    if (isAuthenticated) {
      navigation.replace('Home');
    }
  }, [isAuthenticated]);

  return (
    <>
      <View style={styles.container}>
        {/* ⚙️ Settings button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowModal(true)}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Login</Text>

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

        <Button title="Login" onPress={handleLogin} />

        <Text
          style={{marginTop: 15, color: 'blue'}}
          onPress={() => navigation.navigate('Register')}>
          Don't have an account? Register
        </Text>
      </View>

      <ApiSettingsModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default LoginScreen;
