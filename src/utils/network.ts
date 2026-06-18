import {ServerEntry} from '../types';

export async function probeHost(
  ip: string,
  port: number,
  timeoutMs = 1200,
): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    await fetch(`http://${ip}:${port}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return Date.now() - start;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function probeSupabase(
  supabaseUrl: string,
): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  const start = Date.now();
  try {
    await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return Date.now() - start;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function scanSubnet(
  subnet: string,
  port: number,
  onFound: (entry: ServerEntry) => void,
  onProgress: (scanned: number, total: number) => void,
  concurrency = 25,
): Promise<void> {
  const hosts = Array.from({length: 254}, (_, i) => `${subnet}.${i + 1}`);
  let scanned = 0;

  for (let i = 0; i < hosts.length; i += concurrency) {
    const chunk = hosts.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async host => {
        const latency = await probeHost(host, port);
        scanned++;
        onProgress(scanned, hosts.length);
        if (latency !== null) {
          onFound({ip: host, latencyMs: latency});
        }
      }),
    );
  }
}
