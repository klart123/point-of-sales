// src/components/GCashQR.tsx
import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {buildDynamicQrPh, getQrPhAccount} from '../../utils/qrph';

type Props = {
  staticPayload: string; // decoded text of your GCash My QR (saved in Profile)
  amount: number; // order total, changes per order
  size?: number;
  accountName?: string;
};

const peso = (n: number) =>
  `₱${n.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;

export default function GCashQR({
  staticPayload,
  amount,
  size = 240,
  accountName,
}: Props) {
  const displayName = accountName ?? getQrPhAccount(staticPayload)?.name;

  const {value, error} = useMemo(() => {
    try {
      return {
        value: buildDynamicQrPh(staticPayload, amount),
        error: null as string | null,
      };
    } catch (e: any) {
      return {value: '', error: (e?.message as string) ?? 'QR not available.'};
    }
  }, [staticPayload, amount]);

  if (error || !value) {
    return (
      <View style={styles.card}>
        <Text style={styles.error}>{error ?? 'QR not available.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.brand}>GCash</Text>
      {displayName ? <Text style={styles.name}>{displayName}</Text> : null}

      <View style={styles.qrWrap}>
        {/* key forces a fresh render when the amount changes */}
        <QRCode key={value} value={value} size={size} ecl="M" />
      </View>

      <Text style={styles.amount}>{peso(amount)}</Text>
      <Text style={styles.hint}>
        Open GCash → Scan QR → confirm the amount → Send
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },
  brand: {fontSize: 22, fontWeight: '800', color: '#0057E7'},
  name: {fontSize: 14, color: '#555', marginTop: 2},
  qrWrap: {marginVertical: 16, padding: 12, backgroundColor: '#fff'},
  amount: {fontSize: 28, fontWeight: '700', color: '#111'},
  hint: {marginTop: 8, fontSize: 12, color: '#777', textAlign: 'center'},
  error: {color: '#c00', textAlign: 'center'},
});
