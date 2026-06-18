import React from 'react';
import {View, Text} from 'react-native';
import styles from '../../styles';

export default function LatencyBadge({ms}: {ms: number}) {
  const color = ms < 100 ? '#22c55e' : ms < 400 ? '#f59e0b' : '#ef4444';

  const label = ms < 100 ? 'Great' : ms < 400 ? 'OK' : 'Slow';

  return (
    <View style={[styles.badge, {borderColor: color}]}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text style={[styles.ms, {color}]}>{ms}ms</Text>
      <Text style={[styles.label, {color}]}>{label}</Text>
    </View>
  );
}
