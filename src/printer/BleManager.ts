import {BleManager, Device, State} from 'react-native-ble-plx';

import {NIIMBOT_SERVICE_UUID} from './NiimbotConstants';

class BluetoothManager {
  private manager: BleManager;

  constructor() {
    this.manager = new BleManager();
  }

  get instance() {
    return this.manager;
  }

  async getBluetoothState(): Promise<State> {
    return this.manager.state();
  }

  async getConnectedNiimbot(): Promise<Device | null> {
    try {
      const state = await this.manager.state();

      if (state !== State.PoweredOn) {
        console.log('Bluetooth is not powered on:', state);

        return null;
      }

      const devices = await this.manager.connectedDevices([
        NIIMBOT_SERVICE_UUID,
      ]);

      console.log(
        'Currently connected BLE devices:',
        devices.map(device => ({
          id: device.id,
          name: device.name,
          localName: device.localName,
        })),
      );

      const niimbot = devices.find(device => {
        const name = (device.name || device.localName || '').toUpperCase();

        return name.includes('NIIMBOT') || name.includes('B1');
      });

      return niimbot || null;
    } catch (error) {
      console.error('Failed to get connected NIIMBOT:', error);

      return null;
    }
  }

  destroy() {
    this.manager.destroy();
  }
}

export const bluetoothManager = new BluetoothManager();
