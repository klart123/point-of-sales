import React, {useLayoutEffect} from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './styles';
import {COLORS} from '../../theme';

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
        <TouchableOpacity onPress={onPress} style={{width: 'auto'}}>
          {icon ? (
            <Text style={styles.settingsIcon}>⚙️</Text>
          ) : (
            <View
              style={{
                flex: 1,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                {label}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, label, routeName, onPress]);

  return null; // don't render anything
};

export default HeaderComponent;
