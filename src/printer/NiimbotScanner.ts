import {Device, State} from 'react-native-ble-plx';

import {bluetoothManager} from './BleManager';
import {NIIMBOT_SERVICE_UUID} from './NiimbotConstants';
import {requestBluetoothPermissions} from './BluetoothPermissions';

export async function scanForNiimbotPrinters(
  onFound: (device: Device) => void,
): Promise<() => void> {
  const permission = await requestBluetoothPermissions();

  if (!permission) {
    throw new Error('Bluetooth permission was not granted.');
  }

  const manager = bluetoothManager.instance;

  console.log('Checking Bluetooth state...');

  const startScan = () => {
    console.log('Bluetooth is ready. Starting NIIMBOT scan...');

    manager.startDeviceScan(
      null,
      {
        allowDuplicates: false,
      },
      (error, device) => {
        if (error) {
          console.error('NIIMBOT scan error:', error);
          return;
        }

        if (!device) {
          return;
        }

        const name = device.name || device.localName || '';

        console.log('BLE device found:', name, device.id, device.serviceUUIDs);

        const isNiimbot =
          name.toUpperCase().includes('B1') ||
          name.toUpperCase().includes('NIIMBOT') ||
          device.serviceUUIDs?.some(
            uuid => uuid.toLowerCase() === NIIMBOT_SERVICE_UUID.toLowerCase(),
          );

        if (isNiimbot) {
          console.log('NIIMBOT PRINTER FOUND:', name);

          onFound(device);
        }
      },
    );
  };

  const currentState = await manager.state();

  console.log('Current Bluetooth state:', currentState);

  let stateSubscription: {remove: () => void} | undefined;

  if (currentState === State.PoweredOn) {
    startScan();
  } else {
    console.log('Bluetooth is not ready. Waiting for PoweredOn...');

    stateSubscription = manager.onStateChange(state => {
      console.log('Bluetooth state changed:', state);

      if (state === State.PoweredOn) {
        stateSubscription?.remove();
        stateSubscription = undefined;

        startScan();
      }
    }, true);
  }

  return () => {
    console.log('Stopping NIIMBOT scan...');

    stateSubscription?.remove();
    stateSubscription = undefined;

    manager.stopDeviceScan();
  };
}
