import React from 'react';
import {View, TouchableOpacity, Text, ActivityIndicator} from 'react-native';
import styles from '../../styles';
import LatencyBadge from '../LatencyBadge';

function ServerRow({entry, selected, onPress}) {
  const isSupabase = entry.type === 'supabase';

  return (
    <TouchableOpacity
      style={[styles.serverRow, selected && styles.serverRowSelected]}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={styles.serverRowLeft}>
        <View
          style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <View>
          <Text style={[styles.serverIP, selected && styles.serverIPSelected]}>
            {isSupabase ? '☁️  Supabase Cloud' : entry.ip}
          </Text>
          {entry.label ? (
            <Text style={styles.serverLabel}>{entry.label}</Text>
          ) : null}
        </View>
      </View>
      {entry.latencyMs != null && <LatencyBadge ms={entry.latencyMs} />}
      {entry.latencyMs == null && isSupabase && (
        <ActivityIndicator size="small" color="#6366f1" />
      )}
    </TouchableOpacity>
  );
}

export default ServerRow;
