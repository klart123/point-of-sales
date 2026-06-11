import {Platform} from 'react-native';

export async function getLocalIPAddress(): Promise<string | null> {
  try {
    // Works on both Android and iOS — connects UDP, reads local address
    const {NetworkInfo} = await import('react-native-network-info');
    return await NetworkInfo.getIPV4Address();
  } catch {
    return null;
  }
}
