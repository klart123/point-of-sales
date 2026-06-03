import React from 'react';
import {View, ViewProps} from 'react-native';
import styles from './styles';

type Props = ViewProps & {
  children: React.ReactNode;
};

const ContainerView: React.FC<Props> = ({children, style, ...rest}) => {
  return (
    <View style={[styles.container, style]} {...rest}>
      {children}
    </View>
  );
};

export default ContainerView;
