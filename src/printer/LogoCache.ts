/**
 * LogoCache.ts
 *
 * Handles copying a picked logo image into the app's OWN permanent
 * storage folder, instead of relying on the temporary URI that
 * react-native-image-picker hands back.
 *
 * WHY THIS MATTERS:
 * The URI from the image picker (especially on iOS, e.g. "ph://...")
 * is a reference into the OS photo library cache. It can become
 * invalid after the app restarts, after iOS cleans up temp files,
 * or if the user deletes the original photo. If we store THAT uri
 * in AsyncStorage, the logo can silently disappear later.
 *
 * Instead: as soon as a logo is picked, we copy the actual image
 * BYTES into our app's DocumentDirectory. That file is:
 *   - fully owned by our app
 *   - NOT affected by OS photo-library cleanup
 *   - safe to store the path to in AsyncStorage
 */

import RNFS from 'react-native-fs';

// Always the same filename -> always the same path -> easy to reason about.
const LOGO_FILENAME = 'niimbot_label_logo.png';
const LOGO_PATH = `${RNFS.DocumentDirectoryPath}/${LOGO_FILENAME}`;

/**
 * Copy a picked image (from react-native-image-picker) into permanent
 * app storage. Returns the new, stable file:// URI to save in settings.
 */
export async function cacheLogoImage(pickedUri: string): Promise<string> {
  try {
    // Remove old cached logo first, if one exists.
    if (await RNFS.exists(LOGO_PATH)) {
      await RNFS.unlink(LOGO_PATH);
    }

    // react-native-fs expects a plain path, not a "file://" prefixed one,
    // for the SOURCE argument on some platforms — strip it defensively.
    const sourcePath = pickedUri.startsWith('file://')
      ? pickedUri.replace('file://', '')
      : pickedUri;

    await RNFS.copyFile(sourcePath, LOGO_PATH);

    console.log('[LogoCache] Logo cached at:', LOGO_PATH);

    return `file://${LOGO_PATH}`;
  } catch (error) {
    console.error('[LogoCache] Failed to cache logo image:', error);

    throw new Error(
      'Could not save the logo image. Please try picking it again.',
    );
  }
}

/**
 * Check whether a cached logo currently exists on disk.
 * Useful for validating settings on app startup.
 */
export async function getCachedLogoPath(): Promise<string | null> {
  try {
    const exists = await RNFS.exists(LOGO_PATH);

    return exists ? `file://${LOGO_PATH}` : null;
  } catch (error) {
    console.warn('[LogoCache] Failed to check cached logo:', error);

    return null;
  }
}

/**
 * Delete the cached logo (e.g. when the user taps "Remove").
 */
export async function clearCachedLogo(): Promise<void> {
  try {
    if (await RNFS.exists(LOGO_PATH)) {
      await RNFS.unlink(LOGO_PATH);

      console.log('[LogoCache] Cached logo removed.');
    }
  } catch (error) {
    console.warn('[LogoCache] Failed to clear cached logo:', error);
  }
}
