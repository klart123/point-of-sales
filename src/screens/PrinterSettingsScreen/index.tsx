import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Device, State} from 'react-native-ble-plx';

import {scanForNiimbotPrinters} from '../../printer/NiimbotScanner';
import {NiimbotB1} from '../../printer/NiimbotB1';
import {bluetoothManager} from '../../printer/BleManager';

export default function PrinterSettingsScreen() {
  const [devices, setDevices] = useState<Device[]>([]);

  const [scanning, setScanning] = useState(false);

  const [checking, setChecking] = useState(true);

  const [connecting, setConnecting] = useState(false);

  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const printerRef = useRef<NiimbotB1 | null>(null);

  const scanStopRef = useRef<(() => void) | null>(null);

  if (!printerRef.current) {
    printerRef.current = new NiimbotB1();
  }

  const printer = printerRef.current;

  /**
   * Check if a NIIMBOT is already connected.
   */
  const checkConnectedPrinter = useCallback(async () => {
    try {
      setChecking(true);

      const manager = bluetoothManager.instance;

      const state = await manager.state();

      console.log('Bluetooth state:', state);

      if (state !== State.PoweredOn) {
        console.log('Bluetooth is not ready.');

        setConnectedDevice(null);

        return;
      }

      /*
       * First check devices that are
       * already connected to the phone.
       */
      const connected = await bluetoothManager.getConnectedNiimbot();

      if (connected) {
        console.log('Found connected NIIMBOT:', connected.id);

        setConnectedDevice(connected);

        return;
      }

      /*
       * Nothing currently connected.
       *
       * Try the printer that the user
       * connected previously.
       */
      console.log('No currently connected NIIMBOT.');

      const savedPrinter = await printer.reconnectSavedPrinter();

      if (savedPrinter) {
        console.log('Reconnected saved NIIMBOT:', savedPrinter.id);

        setConnectedDevice(savedPrinter);

        return;
      }

      setConnectedDevice(null);
    } catch (error) {
      console.error('Printer startup check failed:', error);

      setConnectedDevice(null);
    } finally {
      setChecking(false);
    }
  }, [printer]);

  /**
   * Run automatically when screen opens.
   */
  useEffect(() => {
    checkConnectedPrinter();

    return () => {
      scanStopRef.current?.();
      scanStopRef.current = null;
    };
  }, [checkConnectedPrinter]);

  /**
   * Scan for NIIMBOT B1.
   */
  const scan = async () => {
    try {
      /*
       * Stop an existing scan first.
       */
      scanStopRef.current?.();
      scanStopRef.current = null;

      setScanning(true);
      setDevices([]);

      const stopScanning = await scanForNiimbotPrinters(device => {
        setDevices(previous => {
          const exists = previous.some(item => item.id === device.id);

          if (exists) {
            return previous;
          }

          return [...previous, device];
        });
      });

      scanStopRef.current = stopScanning;

      /*
       * Scan for 10 seconds.
       */
      setTimeout(() => {
        stopScanning();

        scanStopRef.current = null;

        setScanning(false);
      }, 10000);
    } catch (error) {
      console.error('Scan error:', error);

      setScanning(false);

      Alert.alert('Bluetooth Error', String(error));
    }
  };

  /**
   * Connect to selected B1.
   */
  const connect = async (device: Device) => {
    try {
      setConnecting(true);

      console.log('Connecting to:', device.id);

      const connected = await printer.connect(device.id);

      setConnectedDevice(connected);

      /*
       * Clear scan results after
       * successful connection.
       */
      setDevices([]);

      scanStopRef.current?.();
      scanStopRef.current = null;

      setScanning(false);

      Alert.alert(
        'Printer Connected',
        `${
          connected.name || connected.localName || 'NIIMBOT B1'
        } is now connected.`,
      );
    } catch (error) {
      console.error('Connection failed:', error);

      Alert.alert('Connection Failed', String(error));
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Disconnect current printer.
   */
  const disconnect = async () => {
    try {
      setConnecting(true);

      await printer.disconnect();

      setConnectedDevice(null);

      Alert.alert('Disconnected', 'NIIMBOT B1 has been disconnected.');
    } catch (error) {
      console.error('Disconnect error:', error);

      Alert.alert('Disconnect Failed', String(error));
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Test current connection.
   */
  const testConnection = async () => {
    try {
      const device = await bluetoothManager.getConnectedNiimbot();

      if (device) {
        setConnectedDevice(device);

        Alert.alert(
          'Printer Connected',
          `Found ${device.name || device.localName || 'NIIMBOT B1'}`,
        );
      } else {
        setConnectedDevice(null);

        Alert.alert('Not Connected', 'NIIMBOT B1 is not currently connected.');
      }
    } catch (error) {
      console.error('Printer test error:', error);

      Alert.alert('Connection Test Failed', String(error));
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

      console.log('Starting NIIMBOT native test page...');

      await printer.printTestPage(25, 15);

      Alert.alert(
        'Test Page Sent',
        'The NIIMBOT B1 accepted the native test-page command.',
      );
    } catch (error) {
      console.error('Test print error:', error);

      Alert.alert(
        'Print Test Failed',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Loading screen while checking.
   */
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

            {/* CONNECTED PRINTER */}
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

                <Text style={styles.deviceId}>Device ID</Text>

                <Text style={styles.deviceIdValue}>{connectedDevice.id}</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={testConnection}>
                    <Text style={styles.testButtonText}>Test Connection</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={disconnect}
                    disabled={connecting}>
                    <Text style={styles.disconnectText}>Disconnect</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.testPrintButton}
                    onPress={printTest}
                    disabled={connecting}>
                    <Text style={styles.testPrintButtonText}>
                      {connecting ? 'Printing...' : 'Print Test Page'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* NO PRINTER */}
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

            {/* SCAN AGAIN */}
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

            {/* NEARBY PRINTERS */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#666',
  },

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

  sectionTitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 5,
  },

  printerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e8f7ed',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  deviceId: {
    marginTop: 15,
    fontSize: 11,
    color: '#888',
  },

  deviceIdValue: {
    marginTop: 3,
    fontSize: 12,
    color: '#555',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  testButton: {
    flex: 1,
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  testButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  disconnectButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },

  disconnectText: {
    fontWeight: '700',
  },

  noPrinterCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  noPrinterTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  noPrinterText: {
    marginTop: 6,
    color: '#777',
    lineHeight: 20,
  },

  scanButton: {
    marginTop: 20,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },

  scanButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  secondaryButtonText: {
    fontWeight: '700',
  },

  nearbyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

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

  deviceInfo: {
    flex: 1,
  },

  deviceName: {
    fontSize: 16,
    fontWeight: '700',
  },

  connectBadge: {
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },

  connectText: {
    color: '#fff',
    fontWeight: '700',
  },

  scanning: {
    padding: 30,
    alignItems: 'center',
  },

  scanningText: {
    marginTop: 10,
    color: '#777',
  },
  testPrintButton: {
    flex: 1,
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  testPrintButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
