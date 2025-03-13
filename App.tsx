import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';

// Define types for navigation
export type RootStackParamList = {
  Home: undefined;
  Details: { message: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View>
      <Text>Home Screen</Text>
      <Button title="Go to Details" onPress={() => navigation.navigate('Details', { message: 'Hello from Home!' })} />
    </View>
  );
};

const DetailsScreen = ({ route }: { route: any }) => {
  return (
    <View>
      <Text>Details Screen</Text>
      <Text>{route.params.message}</Text>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
