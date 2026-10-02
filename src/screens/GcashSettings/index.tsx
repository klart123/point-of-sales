// src/components/GcashSettings.tsx — drop this into your Profile screen
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from '../../redux/store'; // adjust path
import {COLORS} from '../../theme'; // adjust path
import GCashQR from '../../components/GcashQR';
import {validateQrPh} from '../../utils/qrph';
import {
  saveGcashProfile,
  removeGcashProfile,
  readGcashQrFromImage,
  getGcashProfile,
} from '../../services/gcashProfileServices';
import {useFocusEffect} from '@react-navigation/native';

export default function GcashSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const {profile} = useSelector((state: RootState) => state.gcash);

  const [mobile, setMobile] = useState('');
  const [payload, setPayload] = useState('');

  useFocusEffect(
    useCallback(() => {
      dispatch(getGcashProfile());
    }, []),
  );

  // Fill the form from saved values
  useEffect(() => {
    setMobile(profile?.mobile ?? '');
    setPayload(profile?.payload ?? '');
  }, [profile]);

  const error = useMemo(
    () => (payload.trim() ? validateQrPh(payload) : null),
    [payload],
  );
  const canSave = payload.trim().length > 0 && !error;

  const onSave = async () => {
    try {
      await dispatch(saveGcashProfile({mobile, payload}));
      Alert.alert('Saved', 'GCash QR saved on this device.');
    } catch (e: any) {
      Alert.alert("Couldn't save", String(e));
    }
  };

  const onClear = () =>
    Alert.alert('Remove GCash QR?', 'This only removes it from this device.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => dispatch(removeGcashProfile()),
      },
    ]);

  const onUpload = async () => {
    try {
      const text = await dispatch(readGcashQrFromImage());
      if (text) setPayload(text); // validation and the Save button work as before
    } catch (e: any) {
      Alert.alert("Couldn't read QR", e?.message ?? String(e));
    }
  };
  return (
    <View style={styles.card}>
      <ScrollView>
        <Text style={styles.title}>GCash payment QR</Text>

        <TouchableOpacity style={styles.uploadBtn} onPress={onUpload}>
          <Text style={styles.btnGhostText}>Upload QR screenshot</Text>
        </TouchableOpacity>

        <Text style={styles.label}>GCash number (for display)</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
          placeholder="09XX XXX XXXX"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>QR text</Text>
        <Text style={[styles.input, styles.multiline]}>{payload}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, !canSave && styles.btnDisabled]}
            disabled={!canSave}
            onPress={onSave}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
          {profile ? (
            <TouchableOpacity style={styles.btnGhost} onPress={onClear}>
              <Text style={styles.btnGhostText}>Remove</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {profile ? (
          <View style={styles.preview}>
            <Text style={styles.label}>
              Test QR (₱1.00) — scan from another phone
            </Text>
            <GCashQR staticPayload={profile.payload} amount={1} size={180} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.cardSoft,
    borderRadius: 16,
    padding: 10,
  },
  title: {fontSize: 16, fontWeight: '700', marginBottom: 8},
  label: {fontSize: 12, color: '#666', marginTop: 10, marginBottom: 4},
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  multiline: {minHeight: 90, textAlignVertical: 'top'},
  error: {color: '#c00', fontSize: 12, marginTop: 6},
  row: {flexDirection: 'row', gap: 10, marginTop: 14},
  btn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: {opacity: 0.4},
  btnText: {color: '#fff', fontWeight: '700'},
  btnGhost: {
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
  },
  btnGhostText: {color: COLORS.primary, fontWeight: '600'},
  preview: {marginTop: 16, alignItems: 'center'},
  uploadBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
});
