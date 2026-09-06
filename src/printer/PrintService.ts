/**
 * PrintService.ts
 *
 * PUBLIC API for printing NIIMBOT B1 order labels.
 *
 * This is the ONLY file the rest of the app (ordering screens, order
 * submission logic, etc.) should import from to print a label.
 * It hides away AsyncStorage, the BLE connection, and the bitmap
 * rendering — so if something breaks, you know to look here FIRST,
 * then drill into LabelComposer / LogoCache / PrinterSettingsStore
 * only if needed.
 */

import {NiimbotB1} from './NiimbotB1';
import {getSettings, updateSettings} from './PrinterSettingsStore';
import {
  composeLabelBitmap,
  bitmapToPreviewDataUri,
  labelSizeToPixels,
} from './LabelComposer';

export interface OrderLabelData {
  itemName: string;
  customerName: string;
  cupSize: string;
}

export interface PreparedLabel {
  bitmap: boolean[][];
  widthPx: number;
  heightPx: number;
  copies: number;
  density: number;
  previewUri: string; // ready to drop straight into an <Image source={{uri}} />
}

/**
 * A single shared NiimbotB1 instance for the whole app.
 * IMPORTANT: your Printer/Connect screen should also use THIS instance
 * (via getPrinterInstance()) rather than creating its own with
 * `new NiimbotB1()`, otherwise PrintService won't see the connection
 * your Connect screen made.
 */
let printerInstance: NiimbotB1 | null = null;

export function getPrinterInstance(): NiimbotB1 {
  if (!printerInstance) {
    printerInstance = new NiimbotB1();
  }

  return printerInstance;
}

/**
 * Step 1: Build the label bitmap + a preview image, without printing yet.
 * Use this if you want to show a confirmation/preview before sending
 * to the printer.
 */
export async function prepareOrderLabel(
  order: OrderLabelData,
): Promise<PreparedLabel> {
  if (!order.itemName?.trim()) {
    throw new Error('Item name is required to print a label.');
  }

  if (!order.customerName?.trim()) {
    throw new Error('Customer name is required to print a label.');
  }

  const settings = await getSettings();

  const {widthPx, heightPx} = labelSizeToPixels(
    settings.labelWidth,
    settings.labelHeight,
  );

  const bitmap = await composeLabelBitmap(
    {
      logoUri: settings.logoUri,
      itemName: order.itemName,
      customerName: order.customerName,
      cupSize: order.cupSize,
      logoScale: settings.scale,
      logoOffsetX: settings.positionX,
      logoOffsetY: settings.positionY,
    },
    {widthPx, heightPx},
  );

  const previewUri = bitmapToPreviewDataUri(bitmap);

  return {
    bitmap,
    widthPx,
    heightPx,
    copies: settings.copies,
    density: settings.density,
    previewUri,
  };
}

/**
 * Step 2: Send an already-prepared label to the connected printer.
 */
export async function sendLabelToPrinter(label: PreparedLabel): Promise<void> {
  const printer = getPrinterInstance();

  if (!printer.connectedDevice) {
    throw new Error(
      'NIIMBOT B1 is not connected. Please connect it from Printer Settings.',
    );
  }

  await printer.printBitmap(
    label.bitmap,
    label.widthPx,
    label.heightPx,
    label.copies,
    label.density,
    1, // labelType
  );
}

/**
 * Convenience one-shot: prepare + print + remember the values,
 * with no preview step. Use this for the common "just print it" case.
 */
export async function printOrderLabel(order: OrderLabelData): Promise<void> {
  const label = await prepareOrderLabel(order);

  await sendLabelToPrinter(label);

  // Remember these values so the next label pre-fills with them.
  await updateSettings({
    lastItemName: order.itemName,
    lastCustomerName: order.customerName,
    lastCupSize: order.cupSize,
  });
}
