import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';
import {ServerEntry, ServerDiscoveryModalProps} from '../../types';
import {getLocalIP, probeSupabase, scanSubnet} from '../../utils';
import {PulsingDot, ServerRow} from './components';

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
      supabaseServer();

      getLocalIP().then(ip => {
        if (ip) {
          const detectedSubnet = ip.split('.').slice(0, 3).join('.');
          setSubnet(detectedSubnet);
        }
      });
    }
  }, [visible]);

  const scanAbortRef = useRef(false);

  const supabaseServer = () => {
    console.log('process.env.SUPABASE_URL', process.env.SUPABASE_URL);
    const supabaseUrl = process.env.SUPABASE_URL ?? '';
    setServers([
      {
        ip: 'Supabase Cloud',
        label: supabaseUrl,
        type: 'supabase',
        baseURL: supabaseUrl,
      },
    ]);

    probeSupabase(supabaseUrl).then(latency => {
      setServers(prev =>
        prev.map(s =>
          s.type === 'supabase' ? {...s, latencyMs: latency ?? undefined} : s,
        ),
      );
    });
  };

  const startScan = async () => {
    setServers([]);
    setError(null);
    setScanning(true);
    scanAbortRef.current = false;
    setProgress({scanned: 0, total: 254});
    supabaseServer();
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
    const entry = servers.find(s => s.ip === selectedIP);
    if (!entry) return;

    // Use baseURL override for supabase, otherwise build from IP
    const url = entry.baseURL ?? `http://${entry.ip}:${port}`;
    onSelect(url);
    onClose();
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
              <Text style={styles.subtitle}>Current {currentBaseURL}</Text>
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
                onPress={() => {
                  console.log(item);
                  setSelectedIP(item.ip);
                }}
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
              {!selectedIP ? (
                <Text style={styles.confirmText}>Select a server</Text>
              ) : selectedIP.includes('Supabase') ? (
                <Text style={styles.confirmText}>{` ${selectedIP}`}</Text>
              ) : (
                <Text style={styles.confirmText}>
                  {`Use ${selectedIP}:${port}`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
