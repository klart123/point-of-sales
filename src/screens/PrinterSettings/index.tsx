/**
 * PrinterSettings screen.
 *
 * All reads/writes to printer settings go through PrinterSettingsStore.ts.
 * All logo file handling goes through LogoCache.ts.
 * This screen itself holds NO storage logic of its own.
 */

import React, {useEffect, useState, useCallback} from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

import {
  NiimbotB1Settings,
  DEFAULT_SETTINGS,
  getSettings,
  updateSettings,
  resetSettings,
} from '../../printer/PrinterSettingsStore';
import {cacheLogoImage, clearCachedLogo} from '../../printer/LogoCache';

import {
  renderLogoFitPreview,
  labelSizeToPixels,
} from '../../printer/LabelComposer';

export default function PrinterSettings() {
  const [settings, setSettings] = useState<NiimbotB1Settings>(DEFAULT_SETTINGS);
  const [printerConnected, setPrinterConnected] = useState(false);
  const [logoPreviewUri, setLogoPreviewUri] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setPreviewLoading(true);

    const timeout = setTimeout(async () => {
      const layout = labelSizeToPixels(
        settings.labelWidth,
        settings.labelHeight,
      );

      const uri = await renderLogoFitPreview(
        settings.logoUri,
        layout,
        settings.scale,
        settings.positionX,
        settings.positionY,
      );

      if (!cancelled) {
        setLogoPreviewUri(uri);
        setPreviewLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [
    settings.logoUri,
    settings.scale,
    settings.positionX,
    settings.positionY,
    settings.labelWidth,
    settings.labelHeight,
  ]);

  /**
   * Generic helper: update one field, persist it, and refresh local state.
   */
  const setField = async <K extends keyof NiimbotB1Settings>(
    key: K,
    value: NiimbotB1Settings[K],
  ) => {
    const next = await updateSettings({
      [key]: value,
    } as Partial<NiimbotB1Settings>);

    setSettings(next);
  };

  /**
   * Pick a new logo -> copy it into permanent app storage -> save the
   * PERMANENT path (not the picker's temp uri) into settings.
   */
  const pickLogo = async () => {
    try {
      const result = await launchImageLibrary({mediaType: 'photo'});

      const pickedUri = result.assets?.[0]?.uri;

      if (!pickedUri) {
        return; // user cancelled
      }

      const permanentUri = await cacheLogoImage(pickedUri);

      await setField('logoUri', permanentUri);
    } catch (error) {
      console.error('[PrinterSettings] Failed to pick/cache logo:', error);

      Alert.alert(
        'Logo Error',
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const removeLogo = async () => {
    await clearCachedLogo();
    await setField('logoUri', null);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Printer Settings',
      'Restore all printer settings to their defaults? (Your logo will NOT be deleted.)',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const next = await resetSettings();

            setSettings(next);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>NIIMBOT B1</Text>
            <Text style={styles.subtitle}>Printer Settings</Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {backgroundColor: printerConnected ? '#22c55e' : '#ef4444'},
              ]}
            />
            <Text style={styles.statusText}>
              {printerConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>

        {/* LABEL SIZE */}
        <SectionTitle title="Label" />

        <SettingCard>
          <NumberSetting
            title="Width"
            value={settings.labelWidth}
            suffix="mm"
            onMinus={() =>
              setField('labelWidth', Math.max(20, settings.labelWidth - 1))
            }
            onPlus={() =>
              // Capped at ~48mm, since that's the B1's physical printhead
              // limit (384px at 203 DPI). See LabelComposer.labelSizeToPixels.
              setField('labelWidth', Math.min(48, settings.labelWidth + 1))
            }
          />

          <Divider />

          <NumberSetting
            title="Height"
            value={settings.labelHeight}
            suffix="mm"
            onMinus={() =>
              setField('labelHeight', Math.max(10, settings.labelHeight - 1))
            }
            onPlus={() => setField('labelHeight', settings.labelHeight + 1)}
          />

          <Divider />

          <View style={styles.row}>
            <Text style={styles.label}>Orientation</Text>

            <View style={styles.segmentContainer}>
              {(['portrait', 'landscape'] as const).map(item => (
                <Pressable
                  key={item}
                  style={[
                    styles.segment,
                    settings.orientation === item && styles.segmentActive,
                  ]}
                  onPress={() => setField('orientation', item)}>
                  <Text
                    style={[
                      styles.segmentText,
                      settings.orientation === item && styles.segmentTextActive,
                    ]}>
                    {item === 'portrait' ? 'Portrait' : 'Landscape'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </SettingCard>

        {/* LOGO */}
        <SectionTitle title="Logo / Image" />

        <SettingCard>
          <View style={styles.previewContainer}>
            <View style={styles.labelPreview}>
              {previewLoading && !logoPreviewUri && (
                <Text style={styles.previewText}>Loading preview...</Text>
              )}

              {logoPreviewUri && (
                <Image
                  source={{uri: logoPreviewUri}}
                  resizeMode="contain"
                  style={styles.logoPreview}
                />
              )}

              {!previewLoading && !logoPreviewUri && (
                <Text style={styles.previewText}>
                  Could not load logo preview
                </Text>
              )}
            </View>

            <Text style={styles.previewText}>
              {settings.labelWidth} × {settings.labelHeight} mm — exactly as it
              will print
            </Text>
          </View>

          <View style={styles.row}>
            <Pressable style={styles.connectButton} onPress={pickLogo}>
              <Text style={styles.connectButtonText}>
                {settings.logoUri ? 'Change Logo' : 'Choose Logo'}
              </Text>
            </Pressable>

            {settings.logoUri && (
              <Pressable style={styles.removeButton} onPress={removeLogo}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            )}
          </View>

          <Divider />

          {/* SCALE — 100% = auto-fit size, adjust to make the logo bigger/smaller */}
          <NumberSetting
            title="Logo Scale"
            value={settings.scale}
            suffix="%"
            onMinus={() => setField('scale', Math.max(10, settings.scale - 5))}
            onPlus={() => setField('scale', Math.min(300, settings.scale + 5))}
          />

          <Divider />

          {/* POSITION — nudges the logo left/right and up/down from center */}
          <NumberSetting
            title="Position X"
            value={settings.positionX}
            suffix="px"
            onMinus={() => setField('positionX', settings.positionX - 2)}
            onPlus={() => setField('positionX', settings.positionX + 2)}
          />

          <Divider />

          <NumberSetting
            title="Position Y"
            value={settings.positionY}
            suffix="px"
            onMinus={() => setField('positionY', settings.positionY - 2)}
            onPlus={() => setField('positionY', settings.positionY + 2)}
          />

          <Divider />

          <Pressable
            style={styles.resetButton}
            onPress={() => {
              setField('scale', DEFAULT_SETTINGS.scale);
              setField('positionX', DEFAULT_SETTINGS.positionX);
              setField('positionY', DEFAULT_SETTINGS.positionY);
            }}>
            <Text style={styles.resetText}>Reset Logo Fit</Text>
          </Pressable>
        </SettingCard>

        {/* PRINT OPTIONS */}
        <SectionTitle title="Print" />

        <SettingCard>
          <NumberSetting
            title="Copies"
            value={settings.copies}
            suffix=""
            onMinus={() => setField('copies', Math.max(1, settings.copies - 1))}
            onPlus={() => setField('copies', settings.copies + 1)}
          />

          <Divider />

          <NumberSetting
            title="Density"
            value={settings.density}
            suffix="/ 5"
            onMinus={() =>
              setField('density', Math.max(1, settings.density - 1))
            }
            onPlus={() =>
              setField('density', Math.min(5, settings.density + 1))
            }
          />

          <Divider />

          <NumberSetting
            title="Speed"
            value={settings.speed}
            suffix="/ 5"
            onMinus={() => setField('speed', Math.max(1, settings.speed - 1))}
            onPlus={() => setField('speed', Math.min(5, settings.speed + 1))}
          />
        </SettingCard>

        {/* RESET */}
        <Pressable style={styles.resetButton} onPress={handleResetSettings}>
          <Text style={styles.resetText}>Reset Settings</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- shared small components ---------------- */

function SectionTitle({title}: {title: string}) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function SettingCard({children}: {children: React.ReactNode}) {
  return <View style={styles.card}>{children}</View>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function NumberSetting({
  title,
  value,
  suffix,
  onMinus,
  onPlus,
}: {
  title: string;
  value: number;
  suffix: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{title}</Text>

      <View style={styles.numberControl}>
        <Pressable style={styles.numberButton} onPress={onMinus}>
          <Text style={styles.numberButtonText}>−</Text>
        </Pressable>

        <Text style={styles.numberValue}>
          {value}
          {suffix ? <Text style={styles.numberSuffix}> {suffix}</Text> : null}
        </Text>

        <Pressable style={styles.numberButton} onPress={onPlus}>
          <Text style={styles.numberButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F3'},
  content: {padding: 20, paddingBottom: 40},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {fontSize: 24, fontWeight: '700', color: '#111'},
  subtitle: {fontSize: 14, color: '#777', marginTop: 3},
  statusContainer: {flexDirection: 'row', alignItems: 'center'},
  statusDot: {width: 9, height: 9, borderRadius: 5, marginRight: 6},
  statusText: {fontSize: 12, color: '#555'},
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#777',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {fontSize: 15, fontWeight: '600', color: '#222'},
  divider: {height: 1, backgroundColor: '#EEEEEE'},
  connectButton: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  connectButtonText: {color: '#FFF', fontSize: 13, fontWeight: '600'},
  removeButton: {
    marginLeft: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D33',
  },
  removeText: {color: '#D33', fontSize: 13, fontWeight: '600'},
  numberControl: {flexDirection: 'row', alignItems: 'center'},
  numberButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {fontSize: 22, color: '#222'},
  numberValue: {
    minWidth: 60,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  numberSuffix: {fontSize: 11, color: '#888', fontWeight: '400'},
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    padding: 3,
  },
  segment: {paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6},
  segmentActive: {backgroundColor: '#111'},
  segmentText: {fontSize: 11, color: '#666'},
  segmentTextActive: {color: '#FFF', fontWeight: '600'},
  previewContainer: {alignItems: 'center', paddingVertical: 18},
  labelPreview: {
    width: 300,
    height: 180,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  logoPreview: {width: '100%', height: '100%'},
  previewText: {marginTop: 8, fontSize: 11, color: '#888', textAlign: 'center'},
  resetButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  resetText: {color: '#D33', fontSize: 13},
});
