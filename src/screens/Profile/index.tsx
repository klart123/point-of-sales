import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Button, Alert} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {logout} from '../../redux/slices/authSlice';
import * as services from '../../services';
import {AppDispatch, RootState} from '../../redux/store';
import {navigation} from '../../types';
import axiosInstance from '../../Api/axiosInstance';
import {ServerDiscoveryModal} from '../../components';
import {apiActions} from '../../redux/slices/apiSlice';
import {
  removeSocketeUrl,
  saveSocketUrl,
  removeApiBaseUrl,
  saveApiBaseUrl,
} from '../../../env';

type Props = NativeStackScreenProps<navigation.RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {baseURL} = useSelector(state => state.api);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [userProfile, setUserProfile] = useState<object | null>(null);
  const [serversModal, setServersModal] = useState<boolean>(false);

  const {user} = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(services.getUserProfile());
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false); // Set to false after first render
      return;
    }
    setUserProfile(user);
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleSeedDatabase = () => {
    axiosInstance
      .post(`seed`)
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          Alert.alert('Successfully seeded database');
          return;
        }
        console.error('Unable to seed database', response.data);
      })
      .catch(error => {
        console.error('Error seeding database', error);
      });
  };

  const handleOpenServer = () => {
    setServersModal(true);
  };

  const handleSaveUrl = async url => {
    if (!url.startsWith('http')) {
      Alert.alert('Invalid URL', 'Please enter a valid API URL');
      return;
    }
    dispatch(apiActions.setSocketURL(url));

    await removeSocketeUrl();
    await saveSocketUrl(url);

    dispatch(apiActions.setBaseURL(`${url}/api`));
    await removeApiBaseUrl();
    await saveApiBaseUrl(url);

    Alert.alert('Success', 'API Base URL updated!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {/* You can add user info here */}
      <Button
        title="Sync"
        color="#d9534f"
        onPress={() => navigation.navigate('Sync')}
      />
      <Button
        title="Seed database"
        color="#d9534f"
        onPress={handleSeedDatabase}
      />

      <Button title="Servers" color="#d9534f" onPress={handleOpenServer} />
      <Button title="Logout" color="#d9534f" onPress={handleLogout} />
      <ServerDiscoveryModal
        visible={serversModal}
        currentBaseURL={baseURL}
        onSelect={handleSaveUrl}
        onClose={() => {
          setServersModal(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ProfileScreen;
