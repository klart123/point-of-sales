import React, {useLayoutEffect} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './styles';

type Props = {
  label?: string;
  routeName?: string;
  onPress?: () => void;
  icon?: string;
};

const HeaderComponent: React.FC<Props> = ({
  label,
  routeName,
  onPress,
  icon,
}) => {
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
          {icon ? (
            <Text style={styles.settingsIcon}>⚙️</Text>
          ) : (
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
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, label, routeName, onPress]);

  return null; // don't render anything
};

export default HeaderComponent;
