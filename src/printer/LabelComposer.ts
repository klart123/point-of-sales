/**
 * LabelComposer.ts
 *
 * Pure rendering logic: turns { logo, item name, customer name, cup size }
 * into the monochrome boolean[][] bitmap that NiimbotB1.printBitmap()
 * understands.
 *
 * DELIBERATELY has no knowledge of AsyncStorage, Bluetooth, or React
 * components — this makes it easy to test and easy to reason about in
 * isolation if a label ever prints wrong (blank, garbled, wrong size, etc).
 *
 * LOGO SCALE / POSITION:
 * The logo is auto-fit to a sensible default size first (max 35% of
 * label height, or full label width, whichever is smaller). The user's
 * `logoScale` / `logoOffsetX` / `logoOffsetY` settings are then applied
 * ON TOP of that auto-fit, so:
 *   - scale 100 = auto-fit size (default, unchanged behavior)
 *   - scale 150 = 1.5x bigger than auto-fit
 *   - scale 50  = half the auto-fit size
 *   - offsetX/Y = pixels moved from the centered position
 */

import {Image as RNImage} from 'react-native';
import {Skia, ColorType, AlphaType} from '@shopify/react-native-skia';
import {B1_PRINT_WIDTH, B1_DPI} from './NiimbotConstants';

// Bundled fallback logo, used only if no cached logo exists yet.
// Adjust this relative path to match where your assets folder actually is
// relative to THIS file (src/printer/LabelComposer.ts).
const DEFAULT_LOGO_SOURCE = require('../assets/curbside-grinds.png');
const DEFAULT_LOGO_URI = RNImage.resolveAssetSource(DEFAULT_LOGO_SOURCE).uri;

export interface LabelData {
  logoUri?: string | null; // pass null to fall back to the bundled default
  itemName: string;
  customerName: string;
  cupSize: string;

  // NEW: manual logo fit controls (all optional, default = auto-fit centered)
  logoScale?: number; // percent, 100 = auto-fit size
  logoOffsetX?: number; // px, positive = right
  logoOffsetY?: number; // px, positive = down
}

export interface LabelLayout {
  widthPx: number;
  heightPx: number;
}

/**
 * mm -> px at 203 DPI, clamped to the B1's physical printhead width
 * (384px), and rounded down to a multiple of 8 (byte alignment,
 * required by the B1 bitmap-row protocol).
 */
export function labelSizeToPixels(
  widthMm: number,
  heightMm: number,
): LabelLayout {
  const rawWidth = Math.round((widthMm / 25.4) * B1_DPI);

  if (rawWidth > B1_PRINT_WIDTH) {
    const maxMm = ((B1_PRINT_WIDTH / B1_DPI) * 25.4).toFixed(1);

    console.warn(
      `[LabelComposer] Label width ${widthMm}mm (${rawWidth}px) exceeds ` +
        `the B1 printhead width (${B1_PRINT_WIDTH}px ≈ ${maxMm}mm). ` +
        `Clamping to the max printable width.`,
    );
  }

  const clampedWidth = Math.min(rawWidth, B1_PRINT_WIDTH);
  const widthPx = clampedWidth - (clampedWidth % 8);

  const heightPx = Math.round((heightMm / 25.4) * B1_DPI);

  return {widthPx, heightPx};
}

/**
 * Shared helper: given a canvas size and a loaded Skia image, compute
 * the final drawn rect for the logo after applying auto-fit + the
 * user's manual scale/offset.
 *
 * Used by BOTH composeLabelBitmap() (real print) and
 * renderLogoFitPreview() (Settings screen preview) so the two can
 * never drift out of sync with each other.
 */
function computeLogoRect(
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number,
  logoScalePercent: number,
  offsetX: number,
  offsetY: number,
) {
  // Auto-fit: logo caps at 35% of label height, or fits label width
  // (minus a small margin), whichever is more restrictive.
  const maxLogoHeight = Math.floor(canvasHeight * 0.35);

  const autoFitScale = Math.min(
    maxLogoHeight / imageHeight,
    (canvasWidth - 16) / imageWidth,
  );

  const finalScale = autoFitScale * (logoScalePercent / 100);

  const logoW = Math.max(1, Math.round(imageWidth * finalScale));
  const logoH = Math.max(1, Math.round(imageHeight * finalScale));

  // Centered position, then nudged by the user's offset.
  const centeredX = Math.floor((canvasWidth - logoW) / 2);
  const centeredY = 8; // matches the top margin used elsewhere

  const logoX = centeredX + offsetX;
  const logoY = centeredY + offsetY;

  return {logoX, logoY, logoW, logoH};
}

/**
 * Renders the logo + order text onto an offscreen Skia canvas,
 * then converts the pixels into the boolean[][] bitmap the B1 expects.
 */
export async function composeLabelBitmap(
  data: LabelData,
  layout: LabelLayout,
): Promise<boolean[][]> {
  const {widthPx: width, heightPx: height} = layout;

  if (width % 8 !== 0) {
    throw new Error(`Label width ${width}px must be divisible by 8.`);
  }

  const surface = Skia.Surface.MakeOffscreen(width, height);

  if (!surface) {
    throw new Error('Could not create offscreen Skia surface.');
  }

  const canvas = surface.getCanvas();

  const bg = Skia.Paint();
  bg.setColor(Skia.Color('white'));
  canvas.drawRect(Skia.XYWHRect(0, 0, width, height), bg);

  const blackPaint = Skia.Paint();
  blackPaint.setColor(Skia.Color('black'));

  let cursorY = 8;

  const logoUri = data.logoUri ?? DEFAULT_LOGO_URI;
  const logoScale = data.logoScale ?? 100;
  const logoOffsetX = data.logoOffsetX ?? 0;
  const logoOffsetY = data.logoOffsetY ?? 0;

  if (logoUri) {
    try {
      const fileData = await Skia.Data.fromURI(logoUri);
      const image = fileData ? Skia.Image.MakeImageFromEncoded(fileData) : null;

      if (image) {
        const {logoX, logoY, logoW, logoH} = computeLogoRect(
          width,
          height,
          image.width(),
          image.height(),
          logoScale,
          logoOffsetX,
          logoOffsetY,
        );

        canvas.drawImageRect(
          image,
          Skia.XYWHRect(0, 0, image.width(), image.height()),
          Skia.XYWHRect(logoX, logoY, logoW, logoH),
          blackPaint,
        );

        // Text starts below the logo's bottom edge, whatever that
        // ended up being after scale/offset were applied.
        cursorY = logoY + logoH + 10;
      } else {
        console.warn('[LabelComposer] Logo failed to decode:', logoUri);
      }
    } catch (error) {
      console.warn('[LabelComposer] Could not load logo, skipping:', error);
    }
  }

  // ---- TEXT ----
  const fontMgr = Skia.FontMgr.System();
  const typeface = fontMgr.matchFamilyStyle('sans-serif', {
    weight: 700,
    width: 5,
    slant: 0,
  });

  const drawCenteredLine = (
    text: string,
    fontSize: number,
    y: number,
  ): number => {
    const font = Skia.Font(typeface, fontSize);
    const textWidth = font.getTextWidth(text);
    const x = Math.max(4, Math.floor((width - textWidth) / 2));

    canvas.drawText(text, x, y, blackPaint, font);

    return y + fontSize + 6;
  };

  cursorY = drawCenteredLine(data.itemName.toUpperCase(), 26, cursorY + 20);
  cursorY = drawCenteredLine(`Size: ${data.cupSize}`, 20, cursorY);
  cursorY = drawCenteredLine(`For: ${data.customerName}`, 20, cursorY);

  surface.flush();

  const image = surface.makeImageSnapshot();
  const pixels = image.readPixels(0, 0, {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  }) as Uint8Array;

  const bitmap: boolean[][] = [];

  for (let y = 0; y < height; y++) {
    const row: boolean[] = new Array(width);

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const luminance =
        0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];

      row[x] = luminance < 140;
    }

    bitmap.push(row);
  }

  return bitmap;
}

/**
 * Converts a printer bitmap BACK into a viewable PNG data URI, so a
 * print preview shows exactly what will come out of the printer
 * (already thresholded to black & white — no surprises).
 */
export function bitmapToPreviewDataUri(bitmap: boolean[][]): string {
  const height = bitmap.length;
  const width = bitmap[0]?.length ?? 0;

  const surface = Skia.Surface.MakeOffscreen(width, height);

  if (!surface) {
    throw new Error('Could not create preview surface.');
  }

  const canvas = surface.getCanvas();

  const whitePaint = Skia.Paint();
  whitePaint.setColor(Skia.Color('white'));
  canvas.drawRect(Skia.XYWHRect(0, 0, width, height), whitePaint);

  const blackPaint = Skia.Paint();
  blackPaint.setColor(Skia.Color('black'));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (bitmap[y][x]) {
        canvas.drawRect(Skia.XYWHRect(x, y, 1, 1), blackPaint);
      }
    }
  }

  surface.flush();

  const image = surface.makeImageSnapshot();
  const pngData = image.encodeToBase64();

  return `data:image/png;base64,${pngData}`;
}

/**
 * LOGO-ONLY preview, used by the Settings screen's "fit your logo"
 * editor. Draws JUST the logo (no order text) at the given label
 * canvas size, using the exact same computeLogoRect() math that the
 * real print uses — so what you see while adjusting Scale/Position
 * is exactly where the logo will land on the actual label.
 *
 * Returns null if the logo fails to load (e.g. bad/missing file),
 * so the caller can show a fallback message instead of crashing.
 */
export async function renderLogoFitPreview(
  logoUri: string | null,
  layout: LabelLayout,
  logoScalePercent: number,
  offsetX: number,
  offsetY: number,
): Promise<string | null> {
  const {widthPx: width, heightPx: height} = layout;

  const resolvedUri = logoUri ?? DEFAULT_LOGO_URI;

  try {
    const fileData = await Skia.Data.fromURI(resolvedUri);
    const image = fileData ? Skia.Image.MakeImageFromEncoded(fileData) : null;

    if (!image) {
      return null;
    }

    const surface = Skia.Surface.MakeOffscreen(width, height);

    if (!surface) {
      return null;
    }

    const canvas = surface.getCanvas();

    const bg = Skia.Paint();
    bg.setColor(Skia.Color('white'));
    canvas.drawRect(Skia.XYWHRect(0, 0, width, height), bg);

    // Draw a light dashed-style border so the label edges are visible
    // in the preview (helps you see if the logo runs off the edge).
    const borderPaint = Skia.Paint();
    borderPaint.setColor(Skia.Color('#DDDDDD'));
    borderPaint.setStyle(1); // stroke
    borderPaint.setStrokeWidth(1);
    canvas.drawRect(Skia.XYWHRect(0, 0, width, height), borderPaint);

    const blackPaint = Skia.Paint();
    blackPaint.setColor(Skia.Color('black'));

    const {logoX, logoY, logoW, logoH} = computeLogoRect(
      width,
      height,
      image.width(),
      image.height(),
      logoScalePercent,
      offsetX,
      offsetY,
    );

    canvas.drawImageRect(
      image,
      Skia.XYWHRect(0, 0, image.width(), image.height()),
      Skia.XYWHRect(logoX, logoY, logoW, logoH),
      blackPaint,
    );

    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const pngData = snapshot.encodeToBase64();

    return `data:image/png;base64,${pngData}`;
  } catch (error) {
    console.warn('[LabelComposer] Logo fit preview failed:', error);

    return null;
  }
}
