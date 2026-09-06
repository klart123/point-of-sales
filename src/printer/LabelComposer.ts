import {Skia, ColorType, AlphaType} from '@shopify/react-native-skia';
import {B1_PRINT_WIDTH, B1_DPI} from './NiimbotConstants';

export interface LabelData {
  logoUri?: string | null; // local file uri from the image picker, or a bundled require()'d path resolved to a uri
  itemName: string;
  customerName: string;
  cupSize: string; // e.g. "12oz", "16oz"
}

export interface LabelLayout {
  widthPx: number; // must be divisible by 8, <= B1_PRINT_WIDTH (384)
  heightPx: number;
}

/**
 * Renders logo + order text to an offscreen Skia surface,
 * then converts the pixels into the boolean[][] bitmap
 * that NiimbotB1.printBitmap() expects.
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

  // White background
  const bg = Skia.Paint();
  bg.setColor(Skia.Color('white'));
  canvas.drawRect(Skia.XYWHRect(0, 0, width, height), bg);

  const blackPaint = Skia.Paint();
  blackPaint.setColor(Skia.Color('black'));

  let cursorY = 8;

  // ---- LOGO ----
  if (data.logoUri) {
    const fileData = await Skia.Data.fromURI(data.logoUri);
    const image = fileData ? Skia.Image.MakeImageFromEncoded(fileData) : null;

    if (image) {
      const maxLogoHeight = Math.floor(height * 0.35);
      const scale = Math.min(
        maxLogoHeight / image.height(),
        (width - 16) / image.width(),
      );

      const logoW = Math.floor(image.width() * scale);
      const logoH = Math.floor(image.height() * scale);
      const logoX = Math.floor((width - logoW) / 2);

      canvas.drawImageRect(
        image,
        Skia.XYWHRect(0, 0, image.width(), image.height()),
        Skia.XYWHRect(logoX, cursorY, logoW, logoH),
        blackPaint,
      );

      cursorY += logoH + 10;
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

  // ---- Convert to monochrome bitmap ----
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
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      row[x] = luminance < 140; // true = black/printed
    }

    bitmap.push(row);
  }

  return bitmap;
}

/**
 * mm -> px at 203 DPI, clamped to the B1's physical printhead
 * width and rounded down to a multiple of 8 (byte alignment).
 */
export function labelSizeToPixels(
  widthMm: number,
  heightMm: number,
): LabelLayout {
  const rawWidth = Math.round((widthMm / 25.4) * B1_DPI);

  if (rawWidth > B1_PRINT_WIDTH) {
    console.warn(
      `Label width ${widthMm}mm (${rawWidth}px) exceeds the B1 printhead ` +
        `width (${B1_PRINT_WIDTH}px ≈ ${((B1_PRINT_WIDTH / B1_DPI) * 25.4).toFixed(1)}mm). ` +
        `Clamping to the maximum printable width.`,
    );
  }

  const clampedWidth = Math.min(rawWidth, B1_PRINT_WIDTH);
  const widthPx = clampedWidth - (clampedWidth % 8);

  const heightPx = Math.round((heightMm / 25.4) * B1_DPI);

  return {widthPx, heightPx};
}
