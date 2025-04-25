import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Button, Alert} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {logout} from '../../redux/slices/authSlice';
import * as services from '../../Api/userService';
import {AppDispatch, RootState} from '../../redux/store';
import {navigation} from '../../types';

type Props = NativeStackScreenProps<navigation.RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [userProfile, setUserProfile] = useState<object | null>(null);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {/* You can add user info here */}
      <Button title="Logout" color="#d9534f" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ProfileScreen;
