import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServerEntry {
  ip: string;
  latencyMs?: number;
  label?: string;
}

interface ServerDiscoveryModalProps {
  visible: boolean;
  currentBaseURL: string | null;
  onSelect: (baseURL: string) => void;
  onClose: () => void;
  port?: number;
}

// ─── Network Helpers ─────────────────────────────────────────────────────────

/**
 * Get the device's local IP via a dummy UDP trick using fetch.
 * Falls back to null if unavailable.
 */
async function getLocalIP(): Promise<string | null> {
  try {
    // React Native exposes RTCPeerConnection on some setups; use fetch-based
    // heuristic instead: try common gateway IPs
    // In production, replace with react-native-network-info:
    //   import { NetworkInfo } from 'react-native-network-info';
    //   return await NetworkInfo.getIPV4Address();
    return null; // placeholder – see note below
  } catch {
    return null;
  }
}

/**
 * Check if a host:port is reachable by timing a fetch HEAD request.
 * Returns latency in ms, or null if unreachable.
 */
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

async function scanSubnet(
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

// ─── Pulse animation for scanning indicator ───────────────────────────────────

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

// ─── Server Row ───────────────────────────────────────────────────────────────

function ServerRow({
  entry,
  selected,
  onPress,
}: {
  entry: ServerEntry;
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
      style={[styles.serverRow, selected && styles.serverRowSelected]}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={styles.serverRowLeft}>
        <View
          style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <View>
          <Text style={[styles.serverIP, selected && styles.serverIPSelected]}>
            {entry.ip}
          </Text>
          {entry.label ? (
            <Text style={styles.serverLabel}>{entry.label}</Text>
          ) : null}
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

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function ServerDiscoveryModal({
  visible,
  currentBaseURL,
  onSelect,
  onClose,
  port = 3000,
}: ServerDiscoveryModalProps) {
  const [servers, setServers] = useState<ServerEntry[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({scanned: 0, total: 254});
  const [selectedIP, setSelectedIP] = useState<string | null>(null);
  const [manualIP, setManualIP] = useState('');
  const [subnet, setSubnet] = useState('192.168.1');
  const [error, setError] = useState<string | null>(null);

  // Derive selected IP from currentBaseURL on open
  useEffect(() => {
    if (visible && currentBaseURL) {
      try {
        const url = new URL(currentBaseURL);
        setSelectedIP(url.hostname);
      } catch {
        setSelectedIP(null);
      }
    }
  }, [visible, currentBaseURL]);

  const scanAbortRef = useRef(false);

  const startScan = async () => {
    setServers([]);
    setError(null);
    setScanning(true);
    scanAbortRef.current = false;
    setProgress({scanned: 0, total: 254});

    try {
      // Try to get real IP; fall back to letting user set subnet manually
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
            setServers(prev => {
              if (prev.some(s => s.ip === entry.ip)) return prev;
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
      setError(e?.message ?? 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const stopScan = () => {
    scanAbortRef.current = true;
    setScanning(false);
  };

  const handleConfirm = () => {
    if (selectedIP) {
      onSelect(`http://${selectedIP}:${port}`);
      onClose();
    }
  };

  const handleManualAdd = () => {
    const trimmed = manualIP.trim();
    if (!trimmed) return;
    const ip = trimmed.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
    if (!servers.some(s => s.ip === ip)) {
      setServers(prev => [{ip, label: 'Manual'}, ...prev]);
    }
    setSelectedIP(ip);
    setManualIP('');
  };

  const progressPct =
    progress.total > 0
      ? Math.round((progress.scanned / progress.total) * 100)
      : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Server Discovery</Text>
              <Text style={styles.subtitle}>
                Scanning {subnet}.x:{port}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Subnet row */}
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

          {/* Scan button + progress */}
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
                    {progressPct}% · {servers.length} found
                  </Text>
                </View>
                <TouchableOpacity style={styles.stopBtn} onPress={stopScan}>
                  <Text style={styles.stopBtnText}>Stop</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.scanBtn} onPress={startScan}>
                <Text style={styles.scanBtnText}>
                  {servers.length > 0 ? '↺ Rescan' : '⌕ Scan Network'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Server list */}
          <FlatList
            data={servers}
            keyExtractor={item => item.ip}
            style={styles.list}
            contentContainerStyle={
              servers.length === 0 ? styles.listEmpty : styles.listContent
            }
            ListEmptyComponent={
              !scanning ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📡</Text>
                  <Text style={styles.emptyTitle}>No servers found</Text>
                  <Text style={styles.emptyBody}>
                    Make sure your backend is running on port {port} and your
                    device is on the same network.
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
              <ServerRow
                entry={item}
                selected={selectedIP === item.ip}
                onPress={() => setSelectedIP(item.ip)}
              />
            )}
          />

          {/* Manual IP */}
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
            <TouchableOpacity
              style={styles.manualAddBtn}
              onPress={handleManualAdd}>
              <Text style={styles.manualAddText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                !selectedIP && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedIP}>
              <Text style={styles.confirmText}>
                {selectedIP ? `Use ${selectedIP}:${port}` : 'Select a server'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {color: '#94a3b8', fontSize: 13, fontWeight: '600'},

  subnetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  subnetLabel: {fontSize: 13, color: '#64748b', width: 52},
  subnetInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },

  scanRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  scanBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  scanningState: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  progressWrap: {flex: 1, gap: 4},
  progressTrack: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  progressText: {color: '#94a3b8', fontSize: 11},
  stopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  stopBtnText: {color: '#e2e8f0', fontSize: 13, fontWeight: '600'},

  errorText: {
    color: '#f87171',
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 6,
  },

  list: {maxHeight: 280},
  listContent: {paddingHorizontal: 16, paddingVertical: 6},
  listEmpty: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },

  emptyState: {alignItems: 'center', gap: 8, paddingVertical: 10},
  emptyIcon: {fontSize: 32},
  emptyTitle: {color: '#cbd5e1', fontWeight: '600', fontSize: 14},
  emptyBody: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },

  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  serverRowSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b',
  },
  serverRowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {borderColor: '#6366f1'},
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  serverIP: {
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  serverIPSelected: {color: '#a5b4fc'},
  serverLabel: {color: '#64748b', fontSize: 11, marginTop: 1},
  latencyBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  latencyText: {fontSize: 11, fontWeight: '700'},

  manualRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },
  manualAddBtn: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  manualAddText: {color: '#e2e8f0', fontWeight: '600', fontSize: 14},

  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  cancelText: {color: '#94a3b8', fontWeight: '600', fontSize: 14},
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  confirmBtnDisabled: {backgroundColor: '#312e81', opacity: 0.5},
  confirmText: {color: '#fff', fontWeight: '700', fontSize: 14},

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
    backgroundColor: '#6366f1',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#818cf8',
  },
});
