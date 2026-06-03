import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import styles from './styles';
import {RootStackParamList} from '../../types/navigation';
import {ContainerView} from '../../components';

type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen: React.FC<DetailsScreenProps> = ({route}) => {
  return (
    <ContainerView style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Text>{route.params.message}</Text>
    </ContainerView>
  );
};

export default DetailsScreen;
