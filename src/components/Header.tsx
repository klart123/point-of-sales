import React, {useLayoutEffect} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import HeaderButton from './HeaderButton'; // adjust path as needed

type Props = {
  label: string;
  routeName?: string;
  onPress?: () => void;
};

const HeaderComponent: React.FC<Props> = ({label, routeName, onPress}) => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={onPress}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: '#7af',
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              padding: 15,
            }}>
            {label}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, label, routeName, onPress]);

  return null; // don't render anything
};

export default HeaderComponent;
