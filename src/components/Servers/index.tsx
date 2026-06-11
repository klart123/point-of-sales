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
import styles from './styles';
import {NetworkInfo} from 'react-native-network-info';

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
    const ip = await NetworkInfo.getIPV4Address();
    return ip ?? null;
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

  useEffect(() => {
    if (visible) {
      getLocalIP().then(ip => {
        if (ip) {
          const detectedSubnet = ip.split('.').slice(0, 3).join('.');
          setSubnet(detectedSubnet);
        }
      });
    }
  }, [visible]);

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
