/**
 * PrinterSettingsStore.ts
 *
 * Single source of truth for the NIIMBOT B1 printer settings.
 *
 * WHY THIS FILE EXISTS:
 * Previously, both the Settings screen AND the Printer/Connect screen
 * read and wrote AsyncStorage directly with duplicated default values.
 * That's how bugs like "settings don't match between screens" happen.
 *
 * From now on: nobody touches AsyncStorage for printer settings except
 * through the functions exported here.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_KEY = '@niimbot_b1_settings';

export type NiimbotB1Settings = {
  // Physical label size, in millimeters
  labelWidth: number;
  labelHeight: number;

  // Print behavior
  density: number; // 1-5
  speed: number; // 1-5
  copies: number;

  // Logo transform (used only for the on-screen preview transform,
  // not for the printed bitmap layout)
  scale: number;
  positionX: number;
  positionY: number;

  orientation: 'portrait' | 'landscape';
  alignment: 'left' | 'center' | 'right';

  mirror: boolean;
  invert: boolean;

  // IMPORTANT: this is a path into our OWN permanent app storage
  // (see LogoCache.ts), never the raw temp URI from the image picker.
  logoUri: string | null;

  // Remembered so the print form can pre-fill the last values used
  lastItemName: string;
  lastCustomerName: string;
  lastCupSize: string;

  // Selectable cup sizes shown in the ordering UI
  cupSizeOptions: string[];
};

export const DEFAULT_SETTINGS: NiimbotB1Settings = {
  labelWidth: 50,
  labelHeight: 30,

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

  logoUri: null,

  lastItemName: '',
  lastCustomerName: '',
  lastCupSize: '12oz',

  cupSizeOptions: ['8oz', '12oz', '16oz', '20oz'],
};

/**
 * Read current settings, merged over defaults so new fields
 * added later never come back as `undefined` for existing users.
 */
export async function getSettings(): Promise<NiimbotB1Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);

    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(raw),
    };
  } catch (error) {
    console.warn(
      '[PrinterSettingsStore] Failed to read settings, using defaults:',
      error,
    );

    return DEFAULT_SETTINGS;
  }
}

/**
 * Overwrite the entire settings object.
 * Prefer `updateSettings()` below for partial changes.
 */
export async function saveSettings(settings: NiimbotB1Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('[PrinterSettingsStore] Failed to save settings:', error);
    throw new Error('Could not save printer settings.');
  }
}

/**
 * Merge a partial change into the current settings and persist it.
 * This is what the Settings screen and PrintService should use —
 * it avoids accidentally wiping out fields you didn't mean to touch.
 */
export async function updateSettings(
  patch: Partial<NiimbotB1Settings>,
): Promise<NiimbotB1Settings> {
  const current = await getSettings();

  const next: NiimbotB1Settings = {
    ...current,
    ...patch,
  };

  await saveSettings(next);

  return next;
}

/**
 * Restore factory defaults. Does NOT delete the cached logo file —
 * call clearCachedLogo() from LogoCache.ts separately if you want that too.
 */
export async function resetSettings(): Promise<NiimbotB1Settings> {
  await saveSettings(DEFAULT_SETTINGS);

  return DEFAULT_SETTINGS;
}
