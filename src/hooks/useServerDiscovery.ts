import {useState, useCallback} from 'react';
import {scanSubnetForPort} from '../utils/networkScanner';
import {getLocalIPAddress} from '../utils/getLocalIP'; // see below

export function useServerDiscovery(port = 3000) {
  const [servers, setServers] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setScanning(true);
    setServers([]);
    try {
      const myIp = await getLocalIPAddress();
      if (!myIp) throw new Error('Could not get local IP');
      const found = await scanSubnetForPort(myIp, port);
      setServers(found);
      if (found.length === 1) setSelectedServer(found[0]); // auto-select if only one
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setScanning(false);
    }
  }, [port]);

  return {servers, scanning, scan, selectedServer, setSelectedServer};
}
