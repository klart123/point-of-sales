import AsyncStorage from '@react-native-async-storage/async-storage';
import {Device} from 'react-native-ble-plx';

import {bluetoothManager} from './BleManager';

import {
  NIIMBOT_SERVICE_UUID,
  NIIMBOT_CHARACTERISTIC_UUID,
  B1_PRINT_WIDTH,
} from './NiimbotConstants';

const SAVED_PRINTER_KEY = '@curbside_grinds/niimbot_b1_id';

const WRITE_DELAY_MS = 12;
const RESPONSE_TIMEOUT_MS = 3000;

const TEST_DPI = 203;

const PRINT_STATUS_POLL_INTERVAL_MS = 250;
const PRINT_STATUS_TIMEOUT_MS = 25000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Known NIIMBOT printer information.
 */
export interface NiimbotPrinterInfo {
  modelId: number | null;
  modelName: string | null;
  protocolVersion: number | null;

  density: number | null;
  speed: number | null;
  labelType: number | null;

  batteryLevel: number | null;

  serialNumber: string | null;
  softwareVersion: string | null;
  hardwareVersion: string | null;

  bluetoothAddress: string | null;

  printMode: number | null;
}

/**
 * Live printer status.
 *
 * B1 heartbeat fields such as lidClosed/paperInserted
 * are intentionally nullable because the exact D9
 * payload layout is firmware/model dependent.
 */
export interface NiimbotPrinterStatus {
  batteryLevel: number | null;
  temperature: number | null;

  lidClosed?: boolean | null;
  paperInserted?: boolean | null;
  paperRfidSuccess?: boolean | null;

  rawHeartbeat: number[] | null;
}

/**
 * RFID paper information.
 *
 * Not every B1/roll exposes all fields.
 */
export interface NiimbotRfidInfo {
  present: boolean;

  uuid: string | null;

  barcode: string | null;

  serialNumber: string | null;

  totalPaper: number | null;

  usedPaper: number | null;

  consumableType: number | null;

  capacity: number | null;

  raw: number[] | null;
}

/**
 * Complete printer diagnostics.
 */
export interface NiimbotDiagnostics {
  printer: NiimbotPrinterInfo;

  status: NiimbotPrinterStatus;

  rfid: NiimbotRfidInfo;
}

export class NiimbotB1 {
  private device: Device | null = null;

  private monitorSubscription: any = null;

  /**
   * Bytes received from the printer.
   *
   * BLE notifications can arrive fragmented,
   * so we keep a buffer until a complete
   * NIIMBOT frame is available.
   */
  private responseBuffer: number[] = [];

  /**
   * Last detected protocol version.
   */
  private protocolVersion: number | null = null;

  /**
   * Last detected printer model.
   */
  private modelId: number | null = null;

  /**
   * Latest printer information.
   */
  private printerInfo: NiimbotPrinterInfo = {
    modelId: null,
    modelName: null,
    protocolVersion: null,

    density: null,
    speed: null,
    labelType: null,

    batteryLevel: null,

    serialNumber: null,
    softwareVersion: null,
    hardwareVersion: null,

    bluetoothAddress: null,

    printMode: null,
  };

  /**
   * Latest live status.
   */
  private printerStatus: NiimbotPrinterStatus = {
    batteryLevel: null,
    temperature: null,
    rawHeartbeat: null,
  };

  /**
   * Small 5x7 font used for the test label.
   *
   * This avoids requiring Skia or another
   * image rendering library.
   */
  private readonly TEST_FONT: Record<string, string[]> = {
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],

    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],

    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],

    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],

    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],

    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  };

  /**
   * Connect to NIIMBOT.
   */
  async connect(deviceId: string): Promise<Device> {
    const manager = bluetoothManager.instance;

    console.log('================================');
    console.log('Connecting to NIIMBOT:', deviceId);
    console.log('================================');

    /**
     * Clean up previous connection.
     */
    this.monitorSubscription?.remove();
    this.monitorSubscription = null;

    this.responseBuffer = [];

    this.device = await manager.connectToDevice(deviceId, {
      autoConnect: false,
    });

    /**
     * Discover GATT services.
     */
    await this.device.discoverAllServicesAndCharacteristics();

    const services = await this.device.services();

    console.log(
      'NIIMBOT services:',
      services.map(service => service.uuid),
    );

    /**
     * Start notifications BEFORE
     * sending the B1 handshake.
     */
    this.monitorSubscription = this.device.monitorCharacteristicForService(
      NIIMBOT_SERVICE_UUID,
      NIIMBOT_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('NIIMBOT notification error:', error);

          return;
        }

        if (!characteristic?.value) {
          return;
        }

        const bytes = this.base64ToBytes(characteristic.value);

        console.log('NIIMBOT RX:', this.bytesToHex(bytes));

        this.responseBuffer.push(...bytes);
      },
    );

    /**
     * Give the notification subscription
     * a moment to become active.
     */
    await sleep(100);

    /**
     * Perform the B1 connection handshake.
     */
    await this.performHandshake();

    /**
     * Identify printer.
     */
    await this.readPrinterInformation();

    /**
     * Read current live status.
     */
    await this.readPrinterStatus();

    /**
     * Save printer.
     */
    await this.savePrinterId(deviceId);

    console.log('================================');

    console.log(
      'NIIMBOT READY:',
      this.printerInfo.modelName ||
        this.device.name ||
        this.device.localName ||
        deviceId,
    );

    console.log('Model ID:', this.modelId);
    console.log('Protocol:', this.protocolVersion);

    console.log('================================');

    return this.device;
  }

  /**
   * B1 connection handshake.
   *
   * Connect:
   *
   * 03 55 55 C1 01 01 C1 AA AA
   *
   * Then:
   *
   * A5 [01]
   * 40 [08]
   * 40 [0B]
   * 40 [0D]
   * 40 [0A]
   * 40 [07]
   * 40 [03]
   * 40 [0C]
   * 40 [09]
   * DC [04]
   */
  private async performHandshake(): Promise<void> {
    console.log('Starting NIIMBOT B1 handshake...');

    /**
     * Connect command is special:
     * it has a 0x03 prefix.
     */
    const connectResponse = await this.requestResponse(0xc1, [1], 0xc2, true);

    const connectResult = connectResponse.data[0];

    console.log('NIIMBOT connect result:', connectResult);

    if (
      connectResult !== 0x03 &&
      connectResult !== 0x02 &&
      connectResult !== 0x01
    ) {
      throw new Error(
        `NIIMBOT rejected connection. Result: 0x${connectResult
          ?.toString(16)
          .padStart(2, '0')}`,
      );
    }

    /**
     * Protocol status.
     */
    const statusData = await this.requestResponse(0xa5, [1], 0xb5);

    this.protocolVersion = this.parseProtocolVersion(statusData.data);

    console.log('NIIMBOT protocol version:', this.protocolVersion);

    /**
     * B1 handshake printer-info queries.
     */
    const infoCodes = [0x08, 0x0b, 0x0d, 0x0a, 0x07, 0x03, 0x0c, 0x09];

    for (const code of infoCodes) {
      try {
        const response = await this.requestResponse(0x40, [code], 0x40 + code);

        console.log(
          `PrinterInfo 0x${code.toString(16).padStart(2, '0')}:`,
          this.bytesToHex(response.data),
        );
      } catch (error) {
        console.warn(
          `PrinterInfo 0x${code.toString(16).padStart(2, '0')} failed:`,
          error,
        );
      }

      await sleep(WRITE_DELAY_MS);
    }

    /**
     * Advanced heartbeat.
     */
    try {
      await this.requestResponse(0xdc, [4], 0xd9);

      console.log('NIIMBOT heartbeat handshake complete.');
    } catch (error) {
      console.warn('NIIMBOT heartbeat handshake failed:', error);
    }

    console.log('NIIMBOT B1 handshake complete.');
  }

  /**
   * Read printer information.
   */
  async readPrinterInformation(): Promise<NiimbotPrinterInfo> {
    console.log('Reading NIIMBOT printer information...');

    const requests = [
      {
        name: 'density',
        subCommand: 0x01,
        response: 0x41,
      },
      {
        name: 'speed',
        subCommand: 0x02,
        response: 0x42,
      },
      {
        name: 'labelType',
        subCommand: 0x03,
        response: 0x43,
      },
      {
        name: 'modelId',
        subCommand: 0x08,
        response: 0x48,
      },
      {
        name: 'softwareVersion',
        subCommand: 0x09,
        response: 0x49,
      },
      {
        name: 'battery',
        subCommand: 0x0a,
        response: 0x4a,
      },
      {
        name: 'serial',
        subCommand: 0x0b,
        response: 0x4b,
      },
      {
        name: 'hardwareVersion',
        subCommand: 0x0c,
        response: 0x4c,
      },
      {
        name: 'bluetoothAddress',
        subCommand: 0x0d,
        response: 0x4d,
      },
      {
        name: 'printMode',
        subCommand: 0x0e,
        response: 0x4e,
      },
    ];

    for (const item of requests) {
      try {
        const response = await this.requestResponse(
          0x40,
          [item.subCommand],
          item.response,
        );

        this.applyPrinterInfo(item.name, response.data);
      } catch (error) {
        console.warn(`Unable to read ${item.name}:`, error);
      }

      await sleep(WRITE_DELAY_MS);
    }

    console.log('NIIMBOT printer information:', this.printerInfo);

    return {
      ...this.printerInfo,
    };
  }

  /**
   * Parse a PrinterInfo response.
   */
  private applyPrinterInfo(name: string, data: number[]) {
    if (!data.length) {
      return;
    }

    switch (name) {
      case 'density':
        this.printerInfo.density = data[0] ?? null;
        break;

      case 'speed':
        this.printerInfo.speed = data[0] ?? null;
        break;

      case 'labelType':
        this.printerInfo.labelType = data[0] ?? null;
        break;

      case 'modelId':
        this.modelId =
          data.length >= 2 ? (data[0] << 8) | data[1] : (data[0] ?? 0) << 8;

        this.printerInfo.modelId = this.modelId;

        this.printerInfo.modelName = this.getModelName(this.modelId);

        break;

      case 'battery':
        this.printerInfo.batteryLevel = this.batteryBucketToPercent(data[0]);

        break;

      case 'serial':
        this.printerInfo.serialNumber = this.decodeStringOrHex(data);

        break;

      case 'softwareVersion':
        this.printerInfo.softwareVersion = this.decodeVersion(data);

        break;

      case 'hardwareVersion':
        this.printerInfo.hardwareVersion = this.decodeVersion(data);

        break;

      case 'bluetoothAddress':
        this.printerInfo.bluetoothAddress = [...data]
          .reverse()
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join(':')
          .toUpperCase();

        break;

      case 'printMode':
        this.printerInfo.printMode = data[0] ?? null;

        break;

      default:
        break;
    }
  }

  /**
   * Read live printer status.
   *
   * Uses Heartbeat Advanced2 for B1.
   */
  async readPrinterStatus(): Promise<NiimbotPrinterStatus> {
    console.log('Reading NIIMBOT printer status...');

    try {
      const response = await this.requestResponse(0xdc, [4], 0xd9);

      this.parseHeartbeat(response.data, response.raw);
    } catch (error) {
      console.warn('Advanced2 heartbeat failed:', error);

      /**
       * Fallback to Advanced1.
       */
      try {
        const response = await this.requestResponse(0xdc, [1], 0xdd);

        this.parseHeartbeat(response.data, response.raw);
      } catch (fallbackError) {
        console.error('Heartbeat status failed:', fallbackError);
      }
    }

    console.log('NIIMBOT status:', this.printerStatus);

    return {
      ...this.printerStatus,
    };
  }

  /**
   * Parse B1 heartbeat response.
   *
   * IMPORTANT:
   *
   * The 0xD9 Advanced2 response is
   * firmware/model dependent.
   *
   * Do not assume data[1], data[2],
   * data[3] are lid/paper/RFID flags.
   */
  private parseHeartbeat(data: number[], raw: number[]) {
    console.log(
      'NIIMBOT D9 payload:',
      data.map(byte => byte.toString(16).padStart(2, '0')).join(' '),
    );

    console.log('NIIMBOT D9 payload decimal:', data);

    /**
     * First byte appears to be
     * temperature on this B1.
     */
    if (data.length >= 1) {
      this.printerStatus.temperature = data[0];
    }

    /**
     * Battery comes from PrinterInfo.
     */
    this.printerStatus.batteryLevel = this.printerInfo.batteryLevel;

    /**
     * Preserve complete raw packet.
     */
    this.printerStatus.rawHeartbeat = [...raw];

    console.log('NIIMBOT temperature:', this.printerStatus.temperature);

    console.log('NIIMBOT battery:', this.printerStatus.batteryLevel);

    console.log('NIIMBOT raw heartbeat:', raw);
  }

  /**
   * Read RFID paper information.
   */
  async readRfidInfo(): Promise<NiimbotRfidInfo> {
    console.log('Reading NIIMBOT RFID paper information...');

    try {
      const response = await this.requestResponse(0x1a, [1], 0x1b);

      if (response.data.length <= 1) {
        return {
          present: false,
          uuid: null,
          barcode: null,
          serialNumber: null,
          totalPaper: null,
          usedPaper: null,
          consumableType: null,
          capacity: null,
          raw: response.raw,
        };
      }

      const info = this.parseRfidInfo(response.data, response.raw);

      console.log('NIIMBOT RFID info:', info);

      return info;
    } catch (error) {
      console.warn('NIIMBOT RFID information unavailable:', error);

      return {
        present: false,
        uuid: null,
        barcode: null,
        serialNumber: null,
        totalPaper: null,
        usedPaper: null,
        consumableType: null,
        capacity: null,
        raw: null,
      };
    }
  }

  /**
   * Parse RFID response.
   *
   * The B1 response is variable length.
   */
  private parseRfidInfo(data: number[], raw: number[]): NiimbotRfidInfo {
    let offset = 0;

    let uuid: string | null = null;

    if (data.length >= 8) {
      uuid = this.bytesToHex(data.slice(0, 8));

      offset = 8;
    }

    const barcodeResult = this.readLengthPrefixedString(data, offset);

    const barcode = barcodeResult.value;

    offset = barcodeResult.offset;

    const serialResult = this.readLengthPrefixedString(data, offset);

    const serialNumber = serialResult.value;

    offset = serialResult.offset;

    let totalPaper: number | null = null;

    let usedPaper: number | null = null;

    let consumableType: number | null = null;

    let capacity: number | null = null;

    if (offset + 2 <= data.length) {
      totalPaper = (data[offset] << 8) | data[offset + 1];

      offset += 2;
    }

    if (offset + 2 <= data.length) {
      usedPaper = (data[offset] << 8) | data[offset + 1];

      offset += 2;
    }

    if (offset < data.length) {
      consumableType = data[offset];

      offset += 1;
    }

    if (offset + 2 <= data.length) {
      capacity = (data[offset] << 8) | data[offset + 1];
    }

    return {
      present: true,

      uuid,

      barcode,

      serialNumber,

      totalPaper,

      usedPaper,

      consumableType,

      capacity,

      raw: [...raw],
    };
  }

  /**
   * Read a complete diagnostic snapshot.
   */
  async getDiagnostics(): Promise<NiimbotDiagnostics> {
    const printer = await this.readPrinterInformation();

    const status = await this.readPrinterStatus();

    const rfid = await this.readRfidInfo();

    return {
      printer,
      status,
      rfid,
    };
  }

  // ============================================================
  // B1 BITMAP PRINTING
  // ============================================================

  /**
   * Convert millimeters to pixels at 203 DPI.
   */
  private mmToPixels(mm: number): number {
    return Math.round((mm / 25.4) * TEST_DPI);
  }

  /**
   * Set a pixel in the monochrome bitmap.
   *
   * true  = black
   * false = white
   */
  private setPixel(bitmap: boolean[][], x: number, y: number, value = true) {
    if (y < 0 || y >= bitmap.length || x < 0 || x >= bitmap[0].length) {
      return;
    }

    bitmap[y][x] = value;
  }

  /**
   * Draw a rectangle border.
   */
  private drawRectangle(
    bitmap: boolean[][],
    x: number,
    y: number,
    width: number,
    height: number,
    thickness = 2,
  ) {
    for (let t = 0; t < thickness; t++) {
      for (let px = x + t; px < x + width - t; px++) {
        this.setPixel(bitmap, px, y + t, true);

        this.setPixel(bitmap, px, y + height - 1 - t, true);
      }

      for (let py = y + t; py < y + height - t; py++) {
        this.setPixel(bitmap, x + t, py, true);

        this.setPixel(bitmap, x + width - 1 - t, py, true);
      }
    }
  }

  /**
   * Draw 5x7 text.
   */
  private drawText(
    bitmap: boolean[][],
    text: string,
    startX: number,
    startY: number,
    scale = 2,
  ) {
    let cursorX = startX;

    for (const character of text) {
      const glyph = this.TEST_FONT[character];

      if (!glyph) {
        cursorX += 6 * scale;
        continue;
      }

      for (let row = 0; row < glyph.length; row++) {
        const line = glyph[row];

        for (let col = 0; col < line.length; col++) {
          if (line[col] !== '1') {
            continue;
          }

          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              this.setPixel(
                bitmap,
                cursorX + col * scale + sx,
                startY + row * scale + sy,
                true,
              );
            }
          }
        }
      }

      cursorX += 6 * scale;
    }
  }

  /**
   * Create an obvious test bitmap.
   *
   * The image contains:
   *
   * +----------------------+
   * |                      |
   * |       B1 TEST        |
   * |          +           |
   * |          |           |
   * +----------------------+
   */
  private createTestBitmap(width: number, height: number): boolean[][] {
    const bitmap: boolean[][] = Array.from({length: height}, () =>
      Array<boolean>(width).fill(false),
    );

    /**
     * Border.
     */
    this.drawRectangle(bitmap, 8, 8, width - 16, height - 16, 2);

    /**
     * Test text.
     */
    const text = 'B1 TEST';
    const scale = 2;

    const textWidth = text.length * 6 * scale - 2 * scale;

    const textHeight = 7 * scale;

    const textX = Math.floor((width - textWidth) / 2);

    const textY = Math.floor((height - textHeight) / 2);

    this.drawText(bitmap, text, textX, textY, scale);

    /**
     * Center cross.
     */
    const centerX = Math.floor(width / 2);

    const centerY = Math.floor(height / 2);

    for (let x = centerX - 15; x <= centerX + 15; x++) {
      this.setPixel(bitmap, x, centerY, true);
    }

    for (let y = centerY - 15; y <= centerY + 15; y++) {
      this.setPixel(bitmap, centerX, y, true);
    }

    return bitmap;
  }

  /**
   * Convert one bitmap row to the
   * NIIMBOT B1 0x85 payload.
   *
   * Format:
   *
   * row_hi
   * row_lo
   * 00
   * black_count_lo
   * black_count_hi
   * 01
   * bitmap bytes
   *
   * Bitmap is MSB first.
   */
  private createBitmapRowData(
    bitmap: boolean[][],
    row: number,
    width: number,
  ): number[] {
    const bytesPerRow = Math.ceil(width / 8);

    const rowBytes = new Array<number>(bytesPerRow).fill(0);

    let blackPixels = 0;

    for (let x = 0; x < width; x++) {
      if (!bitmap[row][x]) {
        continue;
      }

      blackPixels++;

      const byteIndex = Math.floor(x / 8);

      const bitIndex = 7 - (x % 8);

      rowBytes[byteIndex] |= 1 << bitIndex;
    }

    return [
      (row >> 8) & 0xff,
      row & 0xff,

      0x00,

      blackPixels & 0xff,
      (blackPixels >> 8) & 0xff,

      0x01,

      ...rowBytes,
    ];
  }

  /**
   * Send a one-way packet.
   *
   * 0x85 bitmap rows do not return
   * a response.
   */
  private async sendOneWay(command: number, data: number[]): Promise<void> {
    if (!this.device) {
      throw new Error('NIIMBOT is not connected.');
    }

    const packet = this.createPacket(command, data);

    console.log(
      `NIIMBOT TX ONE-WAY 0x${command.toString(16).padStart(2, '0')}:`,
      this.bytesToHex(packet),
    );

    await this.device.writeCharacteristicWithoutResponseForService(
      NIIMBOT_SERVICE_UUID,
      NIIMBOT_CHARACTERISTIC_UUID,
      this.bytesToBase64(packet),
    );
  }

  /**
   * Poll B1 print status until the
   * requested number of pages has
   * completed.
   */
  private async waitForPrintFinished(targetPages: number): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < PRINT_STATUS_TIMEOUT_MS) {
      try {
        const response = await this.requestResponse(0xa3, [1], 0xb3);

        const data = response.data;

        /**
         * B1 status:
         *
         * data[0..1] = page
         * data[2]    = print %
         * data[3]    = feed %
         * data[4]    = state
         */
        const page = data.length >= 2 ? (data[0] << 8) | data[1] : 0;

        const printPercent = data[2] ?? 0;

        const feedPercent = data[3] ?? 0;

        const state = data[4] ?? null;

        console.log('NIIMBOT PRINT STATUS:', {
          page,
          printPercent,
          feedPercent,
          state,
          raw: data,
        });

        /**
         * Consider complete when:
         *
         * page >= target pages
         *
         * OR
         *
         * both print and feed reach 100%.
         */
        if (
          page >= targetPages ||
          (printPercent >= 100 && feedPercent >= 100)
        ) {
          console.log('NIIMBOT print completed.');

          return;
        }
      } catch (error) {
        console.warn('NIIMBOT print status poll failed:', error);
      }

      await sleep(PRINT_STATUS_POLL_INTERVAL_MS);
    }

    throw new Error('NIIMBOT print timed out while waiting for completion.');
  }

  /**
   * Print an arbitrary monochrome bitmap.
   *
   * width / height are PIXELS.
   *
   * Example:
   *
   * printBitmap(
   *   bitmap,
   *   200,
   *   120,
   *   1,
   *   3,
   *   1
   * )
   */
  async printBitmap(
    bitmap: boolean[][],
    width: number,
    height: number,
    copies = 1,
    density = 3,
    labelType = 1,
  ): Promise<void> {
    if (!this.device) {
      throw new Error('NIIMBOT is not connected.');
    }

    if (width <= 0 || height <= 0) {
      throw new Error('Invalid bitmap dimensions.');
    }

    if (width > B1_PRINT_WIDTH) {
      throw new Error(
        `Width ${width}px exceeds B1 printhead width ${B1_PRINT_WIDTH}px.`,
      );
    }

    /**
     * 200 is divisible by 8,
     * which is ideal for B1 bitmap rows.
     */
    if (width % 8 !== 0) {
      throw new Error(`Width ${width}px must be divisible by 8.`);
    }

    if (bitmap.length !== height) {
      throw new Error(
        `Bitmap height ${bitmap.length} does not match ${height}.`,
      );
    }

    for (const row of bitmap) {
      if (row.length !== width) {
        throw new Error('Bitmap row width does not match print width.');
      }
    }

    if (copies < 1 || copies > 65535) {
      throw new Error('Copies must be between 1 and 65535.');
    }

    if (density < 1 || density > 5) {
      throw new Error('Density must be between 1 and 5.');
    }

    console.log('================================');
    console.log('NIIMBOT B1 BITMAP PRINT');
    console.log('================================');

    console.log('Width:', width, 'px');

    console.log('Height:', height, 'px');

    console.log('Copies:', copies);

    console.log('Density:', density);

    console.log('Label type:', labelType);

    /**
     * 1.
     *
     * SetDensity
     *
     * 21 [density]
     */
    await this.requestResponse(0x21, [density], 0x31);

    await sleep(WRITE_DELAY_MS);

    /**
     * 2.
     *
     * SetLabelType
     *
     * 23 [labelType]
     */
    await this.requestResponse(0x23, [labelType], 0x33);

    await sleep(WRITE_DELAY_MS);

    /**
     * 3.
     *
     * PrintStart
     *
     * B1 uses 7 bytes:
     *
     * pages_hi
     * pages_lo
     * 00
     * 00
     * 00
     * 00
     * pageColor
     */
    await this.requestResponse(
      0x01,
      [(copies >> 8) & 0xff, copies & 0xff, 0x00, 0x00, 0x00, 0x00, 0x00],
      0x02,
    );

    await sleep(WRITE_DELAY_MS);

    /**
     * 4.
     *
     * PageStart
     *
     * 03 [01]
     */
    await this.requestResponse(0x03, [1], 0x04);

    await sleep(WRITE_DELAY_MS);

    /**
     * 5.
     *
     * PageSize
     *
     * B1:
     *
     * height u16 BE
     * width  u16 BE
     * copies u16 BE
     */
    await this.requestResponse(
      0x13,
      [
        (height >> 8) & 0xff,
        height & 0xff,

        (width >> 8) & 0xff,
        width & 0xff,

        (copies >> 8) & 0xff,
        copies & 0xff,
      ],
      0x14,
    );

    await sleep(WRITE_DELAY_MS);

    /**
     * 6.
     *
     * Send bitmap rows.
     *
     * 0x85 is one-way.
     */
    console.log(`Sending ${height} bitmap rows...`);

    for (let row = 0; row < height; row++) {
      const rowData = this.createBitmapRowData(bitmap, row, width);

      await this.sendOneWay(0x85, rowData);

      /**
       * Important B1 pacing.
       */
      await sleep(WRITE_DELAY_MS);
    }

    console.log('All bitmap rows sent.');

    /**
     * 7.
     *
     * PageEnd
     *
     * E3 [01]
     */
    await this.requestResponse(0xe3, [1], 0xe4);

    console.log('NIIMBOT PageEnd accepted.');

    /**
     * IMPORTANT:
     *
     * Do NOT immediately send F3.
     *
     * Wait for the B1 to finish processing
     * the page.
     */
    await this.waitForPrintFinished(copies);

    /**
     * 9.
     *
     * PrintEnd
     *
     * F3 [01]
     */
    await this.requestResponse(0xf3, [1], 0xf4);

    console.log('NIIMBOT PrintEnd accepted.');

    console.log('NIIMBOT bitmap print finished.');

    console.log('================================');
  }

  /**
   * Print a generated test page.
   *
   * The user supplies physical paper
   * dimensions in millimeters.
   *
   * Example:
   *
   * printTestPage(25, 15)
   *
   * produces approximately:
   *
   * 200 x 120 pixels
   */
  async printTestPage(
    paperWidthMm = 25,
    paperHeightMm = 15,
    copies = 1,
    density = 3,
  ): Promise<void> {
    if (!this.device) {
      throw new Error('NIIMBOT is not connected.');
    }

    if (paperWidthMm <= 0 || paperHeightMm <= 0) {
      throw new Error('Paper width and height must be greater than zero.');
    }

    const width = this.mmToPixels(paperWidthMm);

    const height = this.mmToPixels(paperHeightMm);

    /**
     * B1 page widths need to be
     * byte-aligned for our bitmap encoder.
     */
    if (width % 8 !== 0) {
      throw new Error(
        `Calculated width ${width}px is not divisible by 8. ` +
          `Please choose a paper width that produces a byte-aligned width.`,
      );
    }

    console.log('================================');
    console.log('NIIMBOT MANUAL TEST PRINT');
    console.log('================================');

    console.log(`Paper size: ${paperWidthMm} × ${paperHeightMm} mm`);

    console.log(`Bitmap size: ${width} × ${height} px`);

    console.log(`Copies: ${copies}`);

    console.log(`Density: ${density}`);

    /**
     * Generate the test bitmap.
     */
    const bitmap = this.createTestBitmap(width, height);

    /**
     * Use the actual B1 bitmap print
     * protocol.
     */
    await this.printBitmap(bitmap, width, height, copies, density, 1);
  }

  /**
   * Alias for screens that use
   * printTestLabel().
   */
  async printTestLabel(
    paperWidthMm = 25,
    paperHeightMm = 15,
    copies = 1,
    density = 3,
  ): Promise<void> {
    return this.printTestPage(paperWidthMm, paperHeightMm, copies, density);
  }

  /**
   * Send a request and wait for a
   * specific response command.
   */
  private async requestResponse(
    command: number,
    data: number[],
    expectedResponse: number,
    connectPrefix = false,
  ): Promise<{
    raw: number[];
    data: number[];
  }> {
    if (!this.device) {
      throw new Error('NIIMBOT is not connected.');
    }

    /**
     * Remove old matching response
     * before sending a new request.
     */
    this.removeOldResponse(expectedResponse);

    const packet = this.createPacket(command, data);

    const output = connectPrefix ? [0x03, ...packet] : packet;

    console.log(
      `NIIMBOT TX 0x${command.toString(16).padStart(2, '0')}:`,
      this.bytesToHex(output),
    );

    await this.device.writeCharacteristicWithoutResponseForService(
      NIIMBOT_SERVICE_UUID,
      NIIMBOT_CHARACTERISTIC_UUID,
      this.bytesToBase64(output),
    );

    const start = Date.now();

    while (Date.now() - start < RESPONSE_TIMEOUT_MS) {
      const response = this.findFrame(expectedResponse);

      if (response) {
        return response;
      }

      await sleep(20);
    }

    throw new Error(
      `Timeout waiting for NIIMBOT response 0x${expectedResponse
        .toString(16)
        .padStart(2, '0')}.`,
    );
  }

  /**
   * Remove stale response frames.
   */
  private removeOldResponse(command: number) {
    let index = 0;

    while (index < this.responseBuffer.length) {
      if (
        this.responseBuffer[index] === 0x55 &&
        this.responseBuffer[index + 1] === 0x55
      ) {
        const dataLength = this.responseBuffer[index + 3];

        if (dataLength === undefined) {
          return;
        }

        const frameLength = 2 + 1 + 1 + dataLength + 1 + 2;

        if (index + frameLength > this.responseBuffer.length) {
          return;
        }

        const frame = this.responseBuffer.slice(index, index + frameLength);

        if (frame[2] === command) {
          this.responseBuffer.splice(index, frameLength);

          continue;
        }

        index += frameLength;

        continue;
      }

      index++;
    }
  }

  /**
   * Find a complete response frame.
   */
  private findFrame(expectedCommand: number): {
    raw: number[];
    data: number[];
  } | null {
    for (let i = 0; i < this.responseBuffer.length - 4; i++) {
      /**
       * Search for frame header.
       */
      if (
        this.responseBuffer[i] !== 0x55 ||
        this.responseBuffer[i + 1] !== 0x55
      ) {
        continue;
      }

      const command = this.responseBuffer[i + 2];

      const length = this.responseBuffer[i + 3];

      if (length === undefined) {
        return null;
      }

      const frameLength = 2 + 1 + 1 + length + 1 + 2;

      if (i + frameLength > this.responseBuffer.length) {
        return null;
      }

      const frame = this.responseBuffer.slice(i, i + frameLength);

      /**
       * Verify tail.
       */
      if (
        frame[frame.length - 2] !== 0xaa ||
        frame[frame.length - 1] !== 0xaa
      ) {
        continue;
      }

      /**
       * Verify checksum.
       */
      const dataStart = 4;

      const dataEnd = dataStart + length;

      const responseData = frame.slice(dataStart, dataEnd);

      let checksum = command ^ length;

      for (const byte of responseData) {
        checksum ^= byte;
      }

      const receivedChecksum = frame[dataEnd];

      if (checksum !== receivedChecksum) {
        console.warn('NIIMBOT checksum mismatch:', this.bytesToHex(frame));

        this.responseBuffer.splice(i, 1);

        i--;

        continue;
      }

      /**
       * Remove frame from buffer.
       */
      this.responseBuffer.splice(i, frameLength);

      if (command !== expectedCommand) {
        continue;
      }

      return {
        raw: frame,
        data: responseData,
      };
    }

    return null;
  }

  /**
   * Create NIIMBOT packet.
   *
   * 55 55
   * command
   * length
   * data
   * checksum
   * AA AA
   */
  private createPacket(command: number, data: number[] = []): number[] {
    let checksum = command ^ data.length;

    for (const byte of data) {
      checksum ^= byte;
    }

    return [0x55, 0x55, command, data.length, ...data, checksum, 0xaa, 0xaa];
  }

  /**
   * Base64 encode bytes.
   */
  private bytesToBase64(bytes: number[]): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    let result = '';

    let i = 0;

    while (i < bytes.length) {
      const a = bytes[i++] ?? 0;

      const hasB = i < bytes.length;

      const b = hasB ? bytes[i++] : 0;

      const hasC = i < bytes.length;

      const c = hasC ? bytes[i++] : 0;

      const triple = (a << 16) | (b << 8) | c;

      result += chars[(triple >> 18) & 0x3f];

      result += chars[(triple >> 12) & 0x3f];

      result += hasB ? chars[(triple >> 6) & 0x3f] : '=';

      result += hasC ? chars[triple & 0x3f] : '=';
    }

    return result;
  }

  /**
   * Base64 decode.
   */
  private base64ToBytes(base64: string): number[] {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    const bytes: number[] = [];

    let buffer = 0;
    let bits = 0;

    for (const char of base64) {
      if (char === '=') {
        break;
      }

      const value = chars.indexOf(char);

      if (value === -1) {
        continue;
      }

      buffer = (buffer << 6) | value;

      bits += 6;

      if (bits >= 8) {
        bits -= 8;

        bytes.push((buffer >> bits) & 0xff);
      }
    }

    return bytes;
  }

  /**
   * Convert bytes to readable hex.
   */
  private bytesToHex(bytes: number[]): string {
    return bytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
  }

  /**
   * Convert battery bucket:
   *
   * 0 = 0%
   * 1 = 25%
   * 2 = 50%
   * 3 = 75%
   * 4 = 100%
   */
  private batteryBucketToPercent(value?: number): number | null {
    if (value === undefined) {
      return null;
    }

    const levels = [0, 25, 50, 75, 100];

    return levels[value] ?? null;
  }

  /**
   * Protocol version is encoded
   * in response data[11] and data[12].
   */
  private parseProtocolVersion(data: number[]): number | null {
    if (data.length <= 12) {
      return null;
    }

    const versionNumber = data[11] * 100 + data[12];

    if (versionNumber >= 204 && versionNumber < 300) {
      return 3;
    }

    if (versionNumber >= 300 && versionNumber < 302) {
      return 4;
    }

    if (versionNumber >= 302) {
      return 5;
    }

    return null;
  }

  /**
   * Known NIIMBOT model IDs.
   */
  private getModelName(modelId: number | null): string | null {
    switch (modelId) {
      case 4096:
        return 'NIIMBOT B1';

      case 4097:
        return 'NIIMBOT B1 Pro';

      case 4098:
        return 'NIIMBOT B1 SE';

      default:
        return modelId !== null ? `Unknown NIIMBOT (${modelId})` : null;
    }
  }

  /**
   * Decode version bytes.
   */
  private decodeVersion(data: number[]): string | null {
    if (!data.length) {
      return null;
    }

    return data.map(byte => byte.toString(16).padStart(2, '0')).join('.');
  }

  /**
   * Decode string or fallback to hex.
   */
  private decodeStringOrHex(data: number[]): string {
    const printable = data.map(byte => String.fromCharCode(byte)).join('');

    const isAscii =
      data.length >= 1 &&
      [...printable].every(char => {
        const code = char.charCodeAt(0);

        return code >= 32 && code <= 126;
      });

    if (isAscii) {
      return printable;
    }

    return this.bytesToHex(data);
  }

  /**
   * Read length-prefixed string.
   */
  private readLengthPrefixedString(
    data: number[],
    offset: number,
  ): {
    value: string | null;
    offset: number;
  } {
    if (offset >= data.length) {
      return {
        value: null,
        offset,
      };
    }

    const length = data[offset];

    if (length === undefined) {
      return {
        value: null,
        offset,
      };
    }

    offset++;

    if (offset + length > data.length) {
      return {
        value: null,
        offset: data.length,
      };
    }

    const bytes = data.slice(offset, offset + length);

    offset += length;

    return {
      value: bytes.length > 0 ? String.fromCharCode(...bytes) : '',
      offset,
    };
  }

  /**
   * Saved printer reconnect.
   */
  async reconnectSavedPrinter(): Promise<Device | null> {
    const savedId = await AsyncStorage.getItem(SAVED_PRINTER_KEY);

    if (!savedId) {
      console.log('No saved NIIMBOT printer.');

      return null;
    }

    console.log('Trying saved NIIMBOT:', savedId);

    try {
      return await this.connect(savedId);
    } catch (error) {
      console.error('Saved NIIMBOT reconnect failed:', error);

      return null;
    }
  }

  /**
   * Save printer ID.
   */
  async savePrinterId(deviceId: string) {
    await AsyncStorage.setItem(SAVED_PRINTER_KEY, deviceId);
  }

  /**
   * Get saved printer ID.
   */
  async getSavedPrinterId(): Promise<string | null> {
    return AsyncStorage.getItem(SAVED_PRINTER_KEY);
  }

  /**
   * Forget saved printer.
   */
  async forgetSavedPrinter() {
    await AsyncStorage.removeItem(SAVED_PRINTER_KEY);
  }

  /**
   * Disconnect.
   */
  async disconnect() {
    this.monitorSubscription?.remove();
    this.monitorSubscription = null;

    if (this.device) {
      try {
        await this.device.cancelConnection();
      } catch (error) {
        console.error('NIIMBOT disconnect error:', error);
      }
    }

    this.device = null;

    this.responseBuffer = [];

    this.protocolVersion = null;

    this.modelId = null;

    this.printerInfo = {
      modelId: null,
      modelName: null,
      protocolVersion: null,

      density: null,
      speed: null,
      labelType: null,

      batteryLevel: null,

      serialNumber: null,
      softwareVersion: null,
      hardwareVersion: null,

      bluetoothAddress: null,

      printMode: null,
    };

    this.printerStatus = {
      lidClosed: null,
      paperInserted: null,
      paperRfidSuccess: null,

      batteryLevel: null,
      temperature: null,

      rawHeartbeat: null,
    };
  }

  /**
   * Current connected BLE device.
   */
  get connectedDevice() {
    return this.device;
  }

  /**
   * Current printer information.
   */
  get info(): NiimbotPrinterInfo {
    return {
      ...this.printerInfo,
      protocolVersion: this.protocolVersion,
    };
  }

  /**
   * Current printer status.
   */
  get status(): NiimbotPrinterStatus {
    return {
      ...this.printerStatus,
    };
  }
}
