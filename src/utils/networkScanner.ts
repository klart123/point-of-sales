import TcpSocket from 'react-native-tcp-socket';
import {NetworkInfo} from 'react-native-network-info'; // or use a simpler method

export function checkPort(
  host: string,
  port: number,
  timeoutMs = 800,
): Promise<boolean> {
  return new Promise(resolve => {
    const socket = TcpSocket.createConnection(
      {host, port, timeout: timeoutMs},
      () => {
        socket.destroy();
        resolve(true);
      },
    );
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

export async function scanSubnetForPort(
  myIp: string,
  port: number,
  concurrency = 20,
): Promise<string[]> {
  const subnet = myIp.split('.').slice(0, 3).join('.'); // e.g. "192.168.1"
  const hosts = Array.from({length: 254}, (_, i) => `${subnet}.${i + 1}`);
  const found: string[] = [];

  // Process in chunks for concurrency control
  for (let i = 0; i < hosts.length; i += concurrency) {
    const chunk = hosts.slice(i, i + concurrency);
    const results = await Promise.all(
      chunk.map(async host => ({host, open: await checkPort(host, port)})),
    );
    results.filter(r => r.open).forEach(r => found.push(r.host));
  }

  return found;
}
