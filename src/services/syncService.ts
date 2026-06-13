import axios from 'axios';

export type SyncTarget = {type: 'node'; url: string} | {type: 'supabase'};

export interface SyncResult {
  ok: boolean;
  pushed: {orders: number; order_items: number};
  error?: string;
}

export interface NodeInfo {
  ip: string;
  url: string;
  nodeId?: string;
  role?: string;
  verified: boolean;
}

// Ping a discovered IP to confirm it's a POS node
export async function pingNode(ip: string, port = 3000): Promise<NodeInfo> {
  const url = `http://${ip}:${port}`;
  try {
    const {data} = await axios.get(`${url}/sync/ping`, {timeout: 1500});
    return {ip, url, nodeId: data.nodeId, role: data.role, verified: true};
  } catch {
    return {ip, url, verified: false};
  }
}

// Verify all scanned IPs and return NodeInfo list
export async function verifyNodes(
  ips: string[],
  port = 3000,
): Promise<NodeInfo[]> {
  const results = await Promise.all(ips.map(ip => pingNode(ip, port)));
  return results; // return all, let UI decide what to show
}

// Push orders + order_items to a node or supabase
export async function pushSyncToTarget(
  target: SyncTarget,
  since?: string, // ISO string — only sync after this date, or undefined = all
  serverUrl = 'http://localhost:3000', // your Android's own Express server
): Promise<SyncResult> {
  try {
    const body: Record<string, unknown> = {targetType: target.type};

    if (target.type === 'node') {
      body.targetUrl = target.url;
    }

    if (since) {
      body.since = since;
    }

    const {data} = await axios.post(`${serverUrl}/sync/push-to-target`, body, {
      timeout: 15000,
    });

    return data;
  } catch (err: any) {
    return {
      ok: false,
      pushed: {orders: 0, order_items: 0},
      error: err?.response?.data?.error ?? err?.message ?? 'Unknown error',
    };
  }
}
