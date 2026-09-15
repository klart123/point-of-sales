import React, {useCallback, useEffect, useState} from 'react';
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
import {seedDatabase, clearSeededDatabase} from '../../database/seeder';

type Props = NativeStackScreenProps<navigation.RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {baseURL} = useSelector(state => state.api);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [userProfile, setUserProfile] = useState<object | null>(null);
  const [serversModal, setServersModal] = useState<boolean>(false);
  const [seeding, setSeeding] = useState(false);

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

  const handleLocalSeed = useCallback(async () => {
    setSeeding(true);
    try {
      const success = await seedDatabase();
      if (success) {
        Alert.alert(
          'Database Seeded',
          'Local POS sample menu items populated successfully!',
        );
      } else {
        Alert.alert('Skipped', 'Database already contains data records.');
      }
    } catch (error: any) {
      console.log('Error seeding database:', error);
      Alert.alert(
        'Seeding Error',
        error?.message || 'Failed to populate database tables.',
      );
    } finally {
      setSeeding(false);
    }
  }, []);

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

  const handleClearLocalDatabase = useCallback(async () => {
    Alert.alert(
      'Clear Local Database',
      'This will delete all local products, variants, and categories. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setSeeding(true);

              console.log('[Profile] Clearing local database...');

              await clearSeededDatabase();

              Alert.alert(
                'Database Cleared',
                'Local product data has been removed.',
              );
            } catch (error) {
              const message =
                error instanceof Error ? error.message : String(error);

              console.error('[Profile] Clear database failed:', message);

              Alert.alert('Clear Failed', message);
            } finally {
              setSeeding(false);
            }
          },
        },
      ],
    );
  }, []);

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

      <Button
        title="Local Seed"
        color="#d9534f"
        onPress={handleLocalSeed}
        disabled={seeding}
      />
      <Button
        title="Clear Local Database"
        color="#d9534f"
        onPress={handleClearLocalDatabase}
        disabled={seeding}
      />

      <Button title="Servers" color="#d9534f" onPress={handleOpenServer} />
      <Button
        title="Database Debug"
        color="#d9534f"
        onPress={() => navigation.navigate('DatabaseDebug')}
      />
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
