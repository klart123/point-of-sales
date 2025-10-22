import React from 'react';
import {
  TouchableOpacity,
  Text,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import styles from './styles';

interface CustomButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  backgroundColor = '#007BFF',
  textColor = '#fff',
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, {backgroundColor}, style]}
      onPress={onPress}>
      <Text style={[styles.text, {color: textColor}, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
