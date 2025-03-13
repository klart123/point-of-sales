import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import styles from './styles';

// Define navigation types
export type RootStackParamList = {
  Home: undefined;
  Details: { message: string };
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Button title="Go to Details" onPress={() => navigation.navigate('Details', { message: 'Hello from Home!' })} />
    </View>
  );
};

export default HomeScreen;
