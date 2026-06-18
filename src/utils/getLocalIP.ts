import {Platform} from 'react-native';
import {NetworkInfo} from 'react-native-network-info';

export async function getLocalIP(): Promise<string | null> {
  try {
    const ip = await NetworkInfo.getIPV4Address();
    return ip ?? null;
  } catch {
    return null;
  }
}
