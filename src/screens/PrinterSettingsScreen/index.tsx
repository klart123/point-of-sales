/**
 * Printer connect + order-print screen.
 *
 * NOTE: this screen no longer handles logo picking or AsyncStorage
 * directly. Those live in PrinterSettings (settings screen) and
 * PrinterSettingsStore.ts / LogoCache.ts. This screen ONLY:
 *   1. Manages the BLE connection
 *   2. Collects order info (item / customer / cup size)
 *   3. Calls PrintService to do the actual printing
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Device, State} from 'react-native-ble-plx';
import {useNavigation} from '@react-navigation/native';

import {scanForNiimbotPrinters} from '../../printer/NiimbotScanner';
import {bluetoothManager} from '../../printer/BleManager';
import {
  getPrinterInstance,
  prepareOrderLabel,
  sendLabelToPrinter,
  PreparedLabel,
} from '../../printer/PrintService';
import {getSettings} from '../../printer/PrinterSettingsStore';

export default function PrinterSettingsScreen() {
  const navigation = useNavigation();

  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const scanStopRef = useRef<(() => void) | null>(null);

  // IMPORTANT: use the SAME shared printer instance PrintService uses,
  // so a connection made here is visible when PrintService prints later.
  const printer = getPrinterInstance();

  // Order fields
  const [itemName, setItemName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [cupSize, setCupSize] = useState('12oz');
  const [preparing, setPreparing] = useState(false);
  const [printing, setPrinting] = useState(false);

  // Preview modal state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [preparedLabel, setPreparedLabel] = useState<PreparedLabel | null>(
    null,
  );

  /**
   * Pre-fill the order form with the last used values.
   */
  useEffect(() => {
    getSettings().then(settings => {
      setItemName(settings.lastItemName);
      setCustomerName(settings.lastCustomerName);
      setCupSize(settings.lastCupSize);
    });
  }, []);

  const checkConnectedPrinter = useCallback(async () => {
    try {
      setChecking(true);

      const manager = bluetoothManager.instance;
      const state = await manager.state();

      if (state !== State.PoweredOn) {
        setConnectedDevice(null);
        return;
      }

      const connected = await bluetoothManager.getConnectedNiimbot();

      if (connected) {
        setConnectedDevice(connected);
        return;
      }

      const savedPrinter = await printer.reconnectSavedPrinter();

      if (savedPrinter) {
        setConnectedDevice(savedPrinter);
        return;
      }

      setConnectedDevice(null);
    } catch (error) {
      console.error('[PrinterScreen] Startup check failed:', error);
      setConnectedDevice(null);
    } finally {
      setChecking(false);
    }
  }, [printer]);

  useEffect(() => {
    checkConnectedPrinter();

    return () => {
      scanStopRef.current?.();
      scanStopRef.current = null;
    };
  }, [checkConnectedPrinter]);

  const scan = async () => {
    try {
      scanStopRef.current?.();
      scanStopRef.current = null;

      setScanning(true);
      setDevices([]);

      const stopScanning = await scanForNiimbotPrinters(device => {
        setDevices(previous =>
          previous.some(item => item.id === device.id)
            ? previous
            : [...previous, device],
        );
      });

      scanStopRef.current = stopScanning;

      setTimeout(() => {
        stopScanning();
        scanStopRef.current = null;
        setScanning(false);
      }, 10000);
    } catch (error) {
      console.error('[PrinterScreen] Scan error:', error);
      setScanning(false);
      Alert.alert('Bluetooth Error', String(error));
    }
  };

  const connect = async (device: Device) => {
    try {
      setConnecting(true);

      const connected = await printer.connect(device.id);

      setConnectedDevice(connected);
      setDevices([]);

      scanStopRef.current?.();
      scanStopRef.current = null;
      setScanning(false);

      Alert.alert(
        'Printer Connected',
        `${connected.name || connected.localName || 'NIIMBOT B1'} is now connected.`,
      );
    } catch (error) {
      console.error('[PrinterScreen] Connection failed:', error);
      Alert.alert('Connection Failed', String(error));
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      setConnecting(true);

      await printer.disconnect();

      setConnectedDevice(null);

      Alert.alert('Disconnected', 'NIIMBOT B1 has been disconnected.');
    } catch (error) {
      console.error('[PrinterScreen] Disconnect error:', error);
      Alert.alert('Disconnect Failed', String(error));
    } finally {
      setConnecting(false);
    }
  };

  const printTest = async () => {
    try {
      if (!printer.connectedDevice) {
        Alert.alert(
          'Printer Not Connected',
          'Please connect your NIIMBOT B1 first.',
        );
        return;
      }

      setConnecting(true);

      await printer.printTestPage();

      Alert.alert(
        'Test Page Sent',
        'The NIIMBOT B1 accepted the test-page command.',
      );
    } catch (error) {
      console.error('[PrinterScreen] Test print error:', error);
      Alert.alert(
        'Print Test Failed',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setConnecting(false);
    }
  };

  /**
   * STEP 1 of printing an order label: build the bitmap + preview,
   * WITHOUT sending anything to the printer yet.
   */
  const handlePreview = async () => {
    if (!itemName.trim() || !customerName.trim()) {
      Alert.alert('Missing Info', 'Enter an item name and customer name.');
      return;
    }

    try {
      setPreparing(true);

      const label = await prepareOrderLabel({itemName, customerName, cupSize});

      setPreparedLabel(label);
      setPreviewVisible(true);
    } catch (error) {
      console.error('[PrinterScreen] Preview failed:', error);
      Alert.alert(
        'Preview Failed',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setPreparing(false);
    }
  };

  /**
   * STEP 2: user confirmed the preview -> actually send to the printer.
   */
  const handleConfirmPrint = async () => {
    if (!preparedLabel) {
      return;
    }

    try {
      setPrinting(true);

      await sendLabelToPrinter(preparedLabel);

      setPreviewVisible(false);
      setPreparedLabel(null);

      Alert.alert('Printed', 'Label sent to the NIIMBOT B1.');
    } catch (error) {
      console.error('[PrinterScreen] Print failed:', error);
      Alert.alert(
        'Print Failed',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setPrinting(false);
    }
  };

  const openSettings = () => {
    navigation.navigate('PrinterSettings');
  };

  if (checking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Checking printer connection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Printer Settings</Text>

            {connectedDevice && (
              <View style={styles.connectedCard}>
                <View style={styles.connectedHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Receipt / Label Printer
                    </Text>
                    <Text style={styles.printerName}>
                      {connectedDevice.name ||
                        connectedDevice.localName ||
                        'NIIMBOT B1'}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>CONNECTED</Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={printTest}
                    disabled={connecting}>
                    <Text style={styles.testButtonText}>Print Test Page</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={disconnect}
                    disabled={connecting}>
                    <Text style={styles.disconnectText}>Disconnect</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={openSettings}>
                    <Text style={styles.disconnectText}>Settings</Text>
                  </TouchableOpacity>
                </View>

                {/* ORDER LABEL FORM */}
                <Text style={[styles.sectionTitle, {marginTop: 20}]}>
                  Print Order Label
                </Text>

                <TextInput
                  placeholder="Item name"
                  placeholderTextColor="#888"
                  value={itemName}
                  onChangeText={setItemName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Customer name"
                  placeholderTextColor="#888"
                  value={customerName}
                  onChangeText={setCustomerName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Cup size (e.g. 12oz)"
                  placeholderTextColor="#888"
                  value={cupSize}
                  onChangeText={setCupSize}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handlePreview}
                  disabled={preparing}>
                  <Text style={styles.scanButtonText}>
                    {preparing ? 'Preparing...' : 'Preview & Print'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!connectedDevice && (
              <View style={styles.noPrinterCard}>
                <Text style={styles.noPrinterTitle}>No Printer Connected</Text>
                <Text style={styles.noPrinterText}>
                  Connect your NIIMBOT B1 to use it with the POS.
                </Text>

                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={scan}
                  disabled={scanning || connecting}>
                  <Text style={styles.scanButtonText}>
                    {scanning ? 'Scanning...' : 'Scan for B1'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {connectedDevice && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={scan}
                disabled={scanning || connecting}>
                <Text style={styles.secondaryButtonText}>
                  {scanning ? 'Scanning...' : 'Scan for Another B1'}
                </Text>
              </TouchableOpacity>
            )}

            {devices.length > 0 && (
              <Text style={styles.nearbyTitle}>Nearby Printers</Text>
            )}
          </>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.deviceCard}
            onPress={() => connect(item)}
            disabled={connecting}>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>
                {item.name || item.localName || 'NIIMBOT B1'}
              </Text>
              <Text style={styles.deviceId}>{item.id}</Text>
            </View>

            <View style={styles.connectBadge}>
              <Text style={styles.connectText}>
                {connecting ? '...' : 'Connect'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          scanning ? (
            <View style={styles.scanning}>
              <ActivityIndicator />
              <Text style={styles.scanningText}>Looking for NIIMBOT B1...</Text>
            </View>
          ) : null
        }
      />

      {/* PRINT PREVIEW MODAL */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Print Preview</Text>

            {preparedLabel && (
              <>
                <Text style={styles.modalSubtitle}>
                  {preparedLabel.widthPx} × {preparedLabel.heightPx} px —
                  exactly as it will print
                </Text>

                <View style={styles.previewFrame}>
                  <Image
                    source={{uri: preparedLabel.previewUri}}
                    style={{
                      width: '100%',
                      aspectRatio:
                        preparedLabel.widthPx / preparedLabel.heightPx,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </>
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setPreviewVisible(false)}
                disabled={printing}>
                <Text style={styles.disconnectText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testButton}
                onPress={handleConfirmPrint}
                disabled={printing}>
                <Text style={styles.testButtonText}>
                  {printing ? 'Printing...' : 'Print'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7f7'},
  content: {padding: 20, paddingBottom: 40},
  title: {fontSize: 30, fontWeight: '700', color: '#111', marginBottom: 20},
  loading: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingText: {marginTop: 12, color: '#666'},
  connectedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  connectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {fontSize: 13, color: '#777', marginBottom: 5},
  printerName: {fontSize: 20, fontWeight: '700', color: '#111'},
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e8f7ed',
  },
  statusText: {fontSize: 11, fontWeight: '700'},
  deviceId: {marginTop: 15, fontSize: 11, color: '#888'},
  buttonRow: {flexDirection: 'row', gap: 10, marginTop: 20},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  testButton: {
    flex: 1,
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  testButtonText: {color: '#fff', fontWeight: '700'},
  disconnectButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  disconnectText: {fontWeight: '700'},
  noPrinterCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noPrinterTitle: {fontSize: 18, fontWeight: '700'},
  noPrinterText: {marginTop: 6, color: '#777', lineHeight: 20},
  scanButton: {
    marginTop: 20,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanButtonText: {color: '#fff', fontWeight: '700'},
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryButtonText: {fontWeight: '700'},
  nearbyTitle: {fontSize: 18, fontWeight: '700', marginBottom: 10},
  deviceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceInfo: {flex: 1},
  deviceName: {fontSize: 16, fontWeight: '700'},
  connectBadge: {
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  connectText: {color: '#fff', fontWeight: '700'},
  scanning: {padding: 30, alignItems: 'center'},
  scanningText: {marginTop: 10, color: '#777'},
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {fontSize: 18, fontWeight: '700', color: '#111'},
  modalSubtitle: {fontSize: 12, color: '#888', marginTop: 4, marginBottom: 16},
  previewFrame: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonRow: {flexDirection: 'row', gap: 10, marginTop: 20},
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
});
