import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NetworkInfo} from 'react-native-network-info';
import axios from 'axios';
import {COLORS} from '../../theme';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import axiosInstance from '../../Api/axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────

type SyncTargetType = 'node' | 'supabase';

interface NodeEntry {
  ip: string;
  latencyMs?: number;
  label?: string;
  nodeId?: string;
  role?: string;
  verified?: boolean;
}

interface SyncResult {
  ok: boolean;
  pushed?: {orders: number; order_items: number};
  error?: string;
  target?: string;
}

interface SyncScreenProps {
  port?: number;
}

// ─── Network Helpers ──────────────────────────────────────────────────────────

async function getLocalIP(): Promise<string | null> {
  try {
    const ip = await NetworkInfo.getIPV4Address();
    return ip ?? null;
  } catch {
    return null;
  }
}

async function probeHost(
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

async function pingNode(ip: string, port: number): Promise<Partial<NodeEntry>> {
  try {
    const {data} = await axios.get(`http://${ip}:${port}/api/sync/ping`, {
      timeout: 1500,
    });
    return {nodeId: data.nodeId, role: data.role, verified: true};
  } catch {
    return {verified: false};
  }
}

async function scanSubnet(
  subnet: string,
  port: number,
  onFound: (entry: NodeEntry) => void,
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
          // Ping to check if it's a POS node
          const info = await pingNode(host, port);
          onFound({ip: host, latencyMs: latency, ...info});
        }
      }),
    );
  }
}

// ─── Pulse Dot (same as modal) ────────────────────────────────────────────────

function PulsingDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.6,
            duration: 700,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.9,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity, scale]);

  return (
    <View style={styles.pulseWrapper}>
      <Animated.View
        style={[styles.pulseRing, {transform: [{scale}], opacity}]}
      />
      <View style={styles.pulseDot} />
    </View>
  );
}

// ─── Node Row ─────────────────────────────────────────────────────────────────

function NodeRow({
  entry,
  selected,
  onPress,
}: {
  entry: NodeEntry;
  selected: boolean;
  onPress: () => void;
}) {
  const latencyColor =
    entry.latencyMs == null
      ? '#94a3b8'
      : entry.latencyMs < 100
        ? '#22c55e'
        : entry.latencyMs < 400
          ? '#f59e0b'
          : '#ef4444';

  return (
    <TouchableOpacity
      style={[styles.nodeRow, selected && styles.nodeRowSelected]}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={styles.nodeRowLeft}>
        <View
          style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <View style={styles.nodeInfo}>
          <Text style={[styles.nodeIP, selected && styles.nodeIPSelected]}>
            {entry.ip}
          </Text>
          <Text style={styles.nodeSubtext}>
            {entry.verified
              ? `✅ POS Node${entry.nodeId ? ` · ${entry.nodeId}` : ''}${entry.role ? ` (${entry.role})` : ''}`
              : entry.label === 'Manual'
                ? '✏️ Manual entry'
                : '⚠️ Unknown device'}
          </Text>
        </View>
      </View>
      {entry.latencyMs != null && (
        <View style={[styles.latencyBadge, {borderColor: latencyColor}]}>
          <Text style={[styles.latencyText, {color: latencyColor}]}>
            {entry.latencyMs}ms
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Sync Result Banner ───────────────────────────────────────────────────────

function SyncResultBanner({result}: {result: SyncResult}) {
  if (result.ok) {
    return (
      <View style={styles.resultSuccess}>
        <Text style={styles.resultIcon}>✅</Text>
        <View>
          <Text style={styles.resultTitle}>Sync complete</Text>
          <Text style={styles.resultSub}>
            {result.pushed?.orders ?? 0} orders ·{' '}
            {result.pushed?.order_items ?? 0} items
            {result.target ? ` → ${result.target}` : ''}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.resultError}>
      <Text style={styles.resultIcon}>❌</Text>
      <View>
        <Text style={styles.resultTitle}>Sync failed</Text>
        <Text style={styles.resultSub}>{result.error}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SyncScreen({port = 3000}: SyncScreenProps) {
  const {baseURL} = useSelector((state: RootState) => state.api);
  const [nodes, setNodes] = useState<NodeEntry[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({scanned: 0, total: 254});
  const [subnet, setSubnet] = useState('192.168.1');
  const [manualIP, setManualIP] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);

  const [selectedTarget, setSelectedTarget] = useState<{
    type: SyncTargetType;
    url?: string;
  } | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const scanAbortRef = useRef(false);

  // Auto-detect subnet on mount
  useEffect(() => {
    getLocalIP().then(ip => {
      if (ip) setSubnet(ip.split('.').slice(0, 3).join('.'));
    });
  }, []);

  const startScan = useCallback(async () => {
    setNodes([]);
    setScanError(null);
    setSyncResult(null);
    setScanning(true);
    scanAbortRef.current = false;
    setProgress({scanned: 0, total: 254});

    try {
      const localIP = await getLocalIP();
      const activeSubnet = localIP
        ? localIP.split('.').slice(0, 3).join('.')
        : subnet;
      setSubnet(activeSubnet);

      await scanSubnet(
        activeSubnet,
        port,
        entry => {
          if (!scanAbortRef.current) {
            setNodes(prev => {
              if (prev.some(n => n.ip === entry.ip)) return prev;
              return [...prev, entry].sort(
                (a, b) => (a.latencyMs ?? 9999) - (b.latencyMs ?? 9999),
              );
            });
          }
        },
        (scanned, total) => {
          if (!scanAbortRef.current) setProgress({scanned, total});
        },
      );
    } catch (e: any) {
      setScanError(e?.message ?? 'Scan failed');
    } finally {
      setScanning(false);
    }
  }, [subnet, port]);

  const stopScan = () => {
    scanAbortRef.current = true;
    setScanning(false);
  };

  const handleManualAdd = () => {
    const trimmed = manualIP.trim();
    if (!trimmed) return;
    const ip = trimmed.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
    if (!nodes.some(n => n.ip === ip)) {
      setNodes(prev => [{ip, label: 'Manual', verified: false}, ...prev]);
    }
    setSelectedTarget({type: 'node', url: `http://${ip}:${port}`});
    setManualIP('');
  };

  const handleSync = async (since?: string) => {
    if (!selectedTarget) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const body: Record<string, unknown> = {
        targetType: selectedTarget.type,
      };

      if (selectedTarget.type === 'node') body.targetUrl = selectedTarget.url;
      if (since) body.since = since;

      const {data} = await axiosInstance.post(
        `${baseURL}/sync/push-to-target`,
        body,
        {
          timeout: 20000,
        },
      );
      setSyncResult(data);
    } catch (err: any) {
      setSyncResult({
        ok: false,
        error: err?.response?.data?.error ?? err?.message ?? 'Unknown error',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncToday = () => {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    handleSync(since.toISOString());
  };

  const progressPct =
    progress.total > 0
      ? Math.round((progress.scanned / progress.total) * 100)
      : 0;

  const isNodeSelected = (node: NodeEntry) =>
    selectedTarget?.type === 'node' &&
    selectedTarget.url === `http://${node.ip}:${port}`;

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Sync Orders</Text>
        <Text style={styles.subtitle}>
          Push orders & items to another device or cloud
        </Text>
        <Text style={styles.subtitle}>Current IP: {baseURL}</Text>
      </View>

      {/* ── Subnet Row ── */}
      <View style={styles.subnetRow}>
        <Text style={styles.subnetLabel}>Subnet</Text>
        <TextInput
          style={styles.subnetInput}
          value={subnet}
          onChangeText={setSubnet}
          placeholder="192.168.1"
          placeholderTextColor="#64748b"
          keyboardType="numbers-and-punctuation"
          editable={!scanning}
        />
      </View>

      {/* ── Scan Controls ── */}
      <View style={styles.scanRow}>
        {scanning ? (
          <View style={styles.scanningState}>
            <PulsingDot />
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, {width: `${progressPct}%`}]}
                />
              </View>
              <Text style={styles.progressText}>
                {progressPct}% · {nodes.length} found
              </Text>
            </View>
            <TouchableOpacity style={styles.stopBtn} onPress={stopScan}>
              <Text style={styles.stopBtnText}>Stop</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.scanBtn} onPress={startScan}>
            <Text style={styles.scanBtnText}>
              {nodes.length > 0 ? '↺ Rescan' : '⌕ Scan Network'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {scanError ? <Text style={styles.errorText}>{scanError}</Text> : null}

      {/* ── Target List ── */}
      <FlatList
        data={nodes}
        keyExtractor={item => item.ip}
        style={styles.list}
        contentContainerStyle={
          nodes.length === 0 ? styles.listEmpty : styles.listContent
        }
        ListHeaderComponent={
          // Supabase always at top
          <TouchableOpacity
            style={[
              styles.nodeRow,
              styles.supabaseRow,
              selectedTarget?.type === 'supabase' && styles.nodeRowSelected,
            ]}
            onPress={() => setSelectedTarget({type: 'supabase'})}
            activeOpacity={0.75}>
            <View style={styles.nodeRowLeft}>
              <View
                style={[
                  styles.radioOuter,
                  selectedTarget?.type === 'supabase' &&
                    styles.radioOuterSelected,
                ]}>
                {selectedTarget?.type === 'supabase' && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.nodeInfo}>
                <Text
                  style={[
                    styles.nodeIP,
                    selectedTarget?.type === 'supabase' &&
                      styles.nodeIPSelected,
                  ]}>
                  ☁️ Supabase
                </Text>
                <Text style={styles.nodeSubtext}>Cloud sync</Text>
              </View>
            </View>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          !scanning ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📡</Text>
              <Text style={styles.emptyTitle}>No devices found</Text>
              <Text style={styles.emptyBody}>
                Tap Scan Network to find devices on port {port}, or enter an IP
                manually below.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <ActivityIndicator color="#6366f1" size="small" />
              <Text style={styles.emptyBody}>Scanning…</Text>
            </View>
          )
        }
        renderItem={({item}) => (
          <NodeRow
            entry={item}
            selected={isNodeSelected(item)}
            onPress={() =>
              setSelectedTarget({
                type: 'node',
                url: `http://${item.ip}:${port}`,
              })
            }
          />
        )}
      />

      {/* ── Manual IP ── */}
      <View style={styles.manualRow}>
        <TextInput
          style={styles.manualInput}
          value={manualIP}
          onChangeText={setManualIP}
          placeholder="Enter IP manually…"
          placeholderTextColor="#64748b"
          keyboardType="numbers-and-punctuation"
          returnKeyType="done"
          onSubmitEditing={handleManualAdd}
        />
        <TouchableOpacity style={styles.manualAddBtn} onPress={handleManualAdd}>
          <Text style={styles.manualAddText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* ── Sync Result ── */}
      {syncResult && <SyncResultBanner result={syncResult} />}

      {/* ── Sync Buttons ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.syncBtn, !selectedTarget && styles.syncBtnDisabled]}
          onPress={handleSyncToday}
          disabled={syncing || !selectedTarget}>
          <Text style={styles.syncBtnText}>Sync Today</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.syncBtn,
            styles.syncAllBtn,
            !selectedTarget && styles.syncBtnDisabled,
          ]}
          onPress={() => handleSync()}
          disabled={syncing || !selectedTarget}>
          {syncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.syncBtnText}>Sync All</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 25,
  },

  // Header
  header: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Subnet row
  subnetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    marginBottom: 2,
  },
  subnetLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    width: 52,
  },
  subnetInput: {
    flex: 1,
    backgroundColor: COLORS.peach,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },

  // Scan row
  scanRow: {paddingBottom: 12},
  scanBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scanBtnText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  scanningState: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.peach,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 10,
  },
  progressWrap: {flex: 1, gap: 4},
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  stopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.beige,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stopBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },

  errorText: {
    color: COLORS.textError,
    fontSize: 12,
    marginBottom: 6,
  },

  // Pulse dot
  pulseWrapper: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },

  // Node list
  list: {flex: 1},
  listContent: {paddingVertical: 6},
  listEmpty: {flex: 1, justifyContent: 'center'},

  emptyState: {alignItems: 'center', gap: 8, paddingVertical: 10},
  emptyIcon: {fontSize: 32},
  emptyTitle: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyBody: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },

  // Node row — mirrors serverRow from modal styles
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardSoft,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  nodeRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.beige,
  },
  supabaseRow: {
    borderColor: COLORS.border,
  },
  nodeRowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
  nodeInfo: {flex: 1},
  nodeIP: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  nodeIPSelected: {color: COLORS.primary},
  nodeSubtext: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },

  // Radio — exact copy from modal
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {borderColor: COLORS.primary},
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Latency badge — exact copy from modal
  latencyBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  latencyText: {fontSize: 11, fontWeight: '700'},

  // Manual row — mirrors modal manualRow
  manualRow: {
    flexDirection: 'row',
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 10,
  },
  manualInput: {
    flex: 1,
    backgroundColor: COLORS.peach,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },
  manualAddBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  manualAddText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: 14,
  },

  // Result banners
  resultSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.beige,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  resultError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.beige,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.textError,
  },
  resultIcon: {fontSize: 20},
  resultTitle: {fontSize: 14, fontWeight: '700', color: COLORS.text},
  resultSub: {fontSize: 12, color: COLORS.textSecondary, marginTop: 2},

  // Footer sync buttons — mirrors modal footer/confirmBtn pattern
  footer: {
    flexDirection: 'row',
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  syncBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  syncAllBtn: {
    backgroundColor: COLORS.secondary,
  },
  syncBtnDisabled: {
    opacity: 0.45,
  },
  syncBtnText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
  },
});
