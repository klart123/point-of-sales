import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import styles from './styles';

type Props = {
  navigation: NavigationProp<any>;
};

const LandingScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <View style={styles.buttonGroup}>
        <Button title="Login" onPress={() => navigation.navigate('Login')} />
        <Button
          title="Register"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </View>
  );
};

export default LandingScreen;
