// src/services/qrImageDecoder.ts
// Lets the owner pick a screenshot of their GCash "My QR" and returns the QR text.
// The image is only read in memory — it is never saved or uploaded.
import {launchImageLibrary} from 'react-native-image-picker';
import {Skia, ColorType, AlphaType} from '@shopify/react-native-skia';
import jsQR from 'jsqr';

/** Returns the QR text, or null if the user cancelled the picker. */
export async function pickAndDecodeQr(): Promise<string | null> {
  const res = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    includeBase64: true, // keep original size so the QR stays sharp
  });

  if (res.didCancel) return null;
  if (res.errorMessage) throw new Error(res.errorMessage);

  const base64 = res.assets?.[0]?.base64;
  if (!base64) throw new Error('Could not read that image.');

  // Decode the image to raw RGBA pixels with Skia
  const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(base64));
  if (!image) throw new Error('Unsupported image format.');

  const width = image.width();
  const height = image.height();
  const px = image.readPixels(0, 0, {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  }) as Uint8Array | null;
  if (!px) throw new Error('Could not read the image pixels.');

  const rgba = new Uint8ClampedArray(px.buffer, px.byteOffset, px.byteLength);
  const result = jsQR(rgba, width, height);

  if (!result?.data)
    throw new Error(
      'No QR code found. Use a clear screenshot of your GCash My QR.',
    );

  return result.data.trim();
}
