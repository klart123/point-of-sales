import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@niimbot_b1_settings';

export type NiimbotB1Settings = {
  labelWidth: number;
  labelHeight: number;

  bitmapWidth: number;
  bitmapHeight: number;

  density: number;
  speed: number;
  copies: number;

  scale: number;
  positionX: number;
  positionY: number;

  orientation: 'portrait' | 'landscape';
  alignment: 'left' | 'center' | 'right';

  mirror: boolean;
  invert: boolean;

  // NEW: order-label fields
  logoUri: string | null;
  lastItemName: string;
  lastCustomerName: string;
  lastCupSize: string;
  cupSizeOptions: string[];
};

const DEFAULT_SETTINGS: NiimbotB1Settings = {
  labelWidth: 50,
  labelHeight: 30,

  bitmapWidth: 384,
  bitmapHeight: 240,

  density: 3,
  speed: 3,
  copies: 1,

  scale: 100,
  positionX: 0,
  positionY: 0,

  orientation: 'landscape',
  alignment: 'center',

  mirror: false,
  invert: false,

  // NEW
  logoUri: null,
  lastItemName: '',
  lastCustomerName: '',
  lastCupSize: '12oz',
  cupSizeOptions: ['8oz', '12oz', '16oz', '20oz'],
};

import {launchImageLibrary} from 'react-native-image-picker';

export default function PrinterSettings() {
  const [settings, setSettings] = useState<NiimbotB1Settings>(DEFAULT_SETTINGS);

  const [printerConnected, setPrinterConnected] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);

      if (saved) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved),
        });
      }
    } catch (error) {
      console.log('Failed to load printer settings:', error);
    }
  };

  const saveSettings = async (newSettings: NiimbotB1Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

      setSettings(newSettings);
    } catch (error) {
      console.log('Failed to save printer settings:', error);
    }
  };

  const updateSetting = <K extends keyof NiimbotB1Settings>(
    key: K,
    value: NiimbotB1Settings[K],
  ) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };

    saveSettings(newSettings);
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Printer Settings',
      'Restore all printer settings to their defaults?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => saveSettings(DEFAULT_SETTINGS),
        },
      ],
    );
  };

  const pickLogo = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});

    const uri = result.assets?.[0]?.uri;

    if (uri) {
      updateSetting('logoUri', uri);
    }
  };

  const clearLogo = () => {
    updateSetting('logoUri', null);
  };

  const testPrint = () => {
    Alert.alert(
      'Test Print',
      'We will connect this button to your existing NIIMBOT B1 print function.',
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
                {
                  backgroundColor: printerConnected ? '#22c55e' : '#ef4444',
                },
              ]}
            />

            <Text style={styles.statusText}>
              {printerConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>

        {/* CONNECTION */}
        <SectionTitle title="Connection" />

        <SettingCard>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>NIIMBOT B1</Text>
              <Text style={styles.description}>
                {printerConnected ? 'Printer is ready' : 'No printer connected'}
              </Text>
            </View>

            <Pressable
              style={styles.connectButton}
              onPress={() => {
                // TODO:
                // Connect to your existing NiimbotB1 service
                setPrinterConnected(!printerConnected);
              }}>
              <Text style={styles.connectButtonText}>
                {printerConnected ? 'Disconnect' : 'Connect'}
              </Text>
            </Pressable>
          </View>
        </SettingCard>

        {/* LABEL */}
        <SectionTitle title="Label" />

        <SettingCard>
          <NumberSetting
            title="Width"
            value={settings.labelWidth}
            suffix="mm"
            onMinus={() =>
              updateSetting('labelWidth', Math.max(20, settings.labelWidth - 1))
            }
            onPlus={() => updateSetting('labelWidth', settings.labelWidth + 1)}
          />

          <Divider />

          <NumberSetting
            title="Height"
            value={settings.labelHeight}
            suffix="mm"
            onMinus={() =>
              updateSetting(
                'labelHeight',
                Math.max(10, settings.labelHeight - 1),
              )
            }
            onPlus={() =>
              updateSetting('labelHeight', settings.labelHeight + 1)
            }
          />

          <Divider />

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Bitmap</Text>
              <Text style={styles.description}>B1 printable canvas</Text>
            </View>

            <Text style={styles.valueText}>
              {settings.bitmapWidth} × {settings.bitmapHeight}px
            </Text>
          </View>

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
                  onPress={() => updateSetting('orientation', item)}>
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

        {/* LOGO
        <SectionTitle title="Logo / Image" />

        <SettingCard>
          <View style={styles.previewContainer}>
            <View style={styles.labelPreview}>
              <Image
                source={LOGO}
                resizeMode="contain"
                style={[
                  styles.logoPreview,
                  {
                    transform: [
                      {
                        scale: settings.scale / 100,
                      },
                      {
                        translateX: settings.positionX,
                      },
                      {
                        translateY: settings.positionY,
                      },
                    ],
                  },
                ]}
              />
            </View>

            <Text style={styles.previewText}>50 × 30 mm preview</Text>
          </View> */}

        {/* LOGO */}
        <SectionTitle title="Logo / Image" />

        <SettingCard>
          <View style={styles.previewContainer}>
            <View style={styles.labelPreview}>
              {settings.logoUri ? (
                <Image
                  source={{uri: settings.logoUri}}
                  resizeMode="contain"
                  style={[
                    styles.logoPreview,
                    {
                      transform: [
                        {scale: settings.scale / 100},
                        {translateX: settings.positionX},
                        {translateY: settings.positionY},
                      ],
                    },
                  ]}
                />
              ) : (
                <Text style={styles.previewText}>No logo selected</Text>
              )}
            </View>

            <Text style={styles.previewText}>
              {settings.labelWidth} × {settings.labelHeight} mm preview
            </Text>
          </View>

          <View style={styles.row}>
            <Pressable style={styles.connectButton} onPress={pickLogo}>
              <Text style={styles.connectButtonText}>
                {settings.logoUri ? 'Change Logo' : 'Choose Logo'}
              </Text>
            </Pressable>

            {settings.logoUri && (
              <Pressable style={styles.resetButton} onPress={clearLogo}>
                <Text style={styles.resetText}>Remove</Text>
              </Pressable>
            )}
          </View>

          <Divider />

          <NumberSetting
            title="Scale"
            value={settings.scale}
            suffix="%"
            onMinus={() =>
              updateSetting('scale', Math.max(10, settings.scale - 5))
            }
            onPlus={() =>
              updateSetting('scale', Math.min(200, settings.scale + 5))
            }
          />

          <Divider />

          <NumberSetting
            title="Position X"
            value={settings.positionX}
            suffix="px"
            onMinus={() => updateSetting('positionX', settings.positionX - 5)}
            onPlus={() => updateSetting('positionX', settings.positionX + 5)}
          />

          <Divider />

          <NumberSetting
            title="Position Y"
            value={settings.positionY}
            suffix="px"
            onMinus={() => updateSetting('positionY', settings.positionY - 5)}
            onPlus={() => updateSetting('positionY', settings.positionY + 5)}
          />

          <Divider />

          <View style={styles.row}>
            <Text style={styles.label}>Mirror</Text>

            <Switch
              value={settings.mirror}
              onValueChange={value => updateSetting('mirror', value)}
            />
          </View>

          <Divider />

          <View style={styles.row}>
            <Text style={styles.label}>Invert</Text>

            <Switch
              value={settings.invert}
              onValueChange={value => updateSetting('invert', value)}
            />
          </View>
        </SettingCard>

        {/* PRINT */}
        <SectionTitle title="Print" />

        <SettingCard>
          <NumberSetting
            title="Copies"
            value={settings.copies}
            suffix=""
            onMinus={() =>
              updateSetting('copies', Math.max(1, settings.copies - 1))
            }
            onPlus={() => updateSetting('copies', settings.copies + 1)}
          />

          <Divider />

          <NumberSetting
            title="Density"
            value={settings.density}
            suffix="/ 5"
            onMinus={() =>
              updateSetting('density', Math.max(1, settings.density - 1))
            }
            onPlus={() =>
              updateSetting('density', Math.min(5, settings.density + 1))
            }
          />

          <Divider />

          <NumberSetting
            title="Speed"
            value={settings.speed}
            suffix="/ 5"
            onMinus={() =>
              updateSetting('speed', Math.max(1, settings.speed - 1))
            }
            onPlus={() =>
              updateSetting('speed', Math.min(5, settings.speed + 1))
            }
          />

          <Divider />

          <View style={styles.row}>
            <Text style={styles.label}>Alignment</Text>

            <View style={styles.segmentContainer}>
              {(['left', 'center', 'right'] as const).map(item => (
                <Pressable
                  key={item}
                  style={[
                    styles.smallSegment,
                    settings.alignment === item && styles.segmentActive,
                  ]}
                  onPress={() => updateSetting('alignment', item)}>
                  <Text
                    style={[
                      styles.segmentText,
                      settings.alignment === item && styles.segmentTextActive,
                    ]}>
                    {item[0].toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </SettingCard>

        {/* TEST PRINT */}
        <Pressable style={styles.testButton} onPress={testPrint}>
          <Text style={styles.testButtonText}>TEST PRINT</Text>
        </Pressable>

        {/* RESET */}
        <Pressable style={styles.resetButton} onPress={resetSettings}>
          <Text style={styles.resetText}>Reset Settings</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------ */
/* COMPONENTS */
/* ------------------------------------------------ */

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
          {suffix && <Text style={styles.numberSuffix}> {suffix}</Text>}
        </Text>

        <Pressable style={styles.numberButton} onPress={onPlus}>
          <Text style={styles.numberButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F3',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 3,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    color: '#555',
  },

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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  description: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },

  valueText: {
    fontSize: 13,
    color: '#555',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  connectButton: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },

  connectButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },

  numberControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  numberButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  numberButtonText: {
    fontSize: 22,
    color: '#222',
  },

  numberValue: {
    minWidth: 60,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  numberSuffix: {
    fontSize: 11,
    color: '#888',
    fontWeight: '400',
  },

  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    padding: 3,
  },

  segment: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },

  smallSegment: {
    width: 38,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },

  segmentActive: {
    backgroundColor: '#111',
  },

  segmentText: {
    fontSize: 11,
    color: '#666',
  },

  segmentTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  previewContainer: {
    alignItems: 'center',
    paddingVertical: 18,
  },

  labelPreview: {
    width: 300,
    height: 180,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoPreview: {
    width: 260,
    height: 150,
  },

  previewText: {
    marginTop: 8,
    fontSize: 11,
    color: '#888',
  },

  testButton: {
    height: 52,
    backgroundColor: '#111',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  testButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },

  resetButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  resetText: {
    color: '#D33',
    fontSize: 13,
  },
});
