import React from 'react';
import {
  TouchableOpacity,
  Text,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import styles from './styles';
import {COLORS} from '../../theme';

interface CustomButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  backgroundColor = COLORS.buttonPrimary,
  textColor = COLORS.buttonText,
  style,
  textStyle,
  loading,
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, {backgroundColor}, style]}
      onPress={onPress}
      disabled={disabled}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={[styles.text, {color: textColor}, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
