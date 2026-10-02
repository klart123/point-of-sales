import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import GCashQR from './index';

type Props = {
  visible: boolean;
  onClose: () => void;
  staticPayload: string | undefined;
  amount: number;
  accountName?: string;
};

export default function GCashQRModal({
  visible,
  onClose,
  staticPayload,
  amount,
  accountName,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>GCash Payment</Text>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <GCashQR
            staticPayload={staticPayload}
            amount={amount}
            accountName={accountName}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 26,
    lineHeight: 28,
    color: '#555',
  },

  cancelButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
