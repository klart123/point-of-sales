// src/utils/qrph.ts

/** CRC16-CCITT (poly 0x1021, init 0xFFFF) — the checksum QR Ph requires. */
export function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

type Tlv = {tag: string; value: string};

function parseTlv(payload: string): Tlv[] {
  const out: Tlv[] = [];
  let i = 0;
  while (i < payload.length) {
    if (i + 4 > payload.length) throw new Error('Invalid QR Ph payload');
    const tag = payload.slice(i, i + 2);
    const len = parseInt(payload.slice(i + 2, i + 4), 10);
    if (Number.isNaN(len) || i + 4 + len > payload.length)
      throw new Error('Invalid QR Ph payload');
    out.push({tag, value: payload.slice(i + 4, i + 4 + len)});
    i += 4 + len;
  }
  return out;
}

const encodeTlv = ({tag, value}: Tlv) =>
  `${tag}${String(value.length).padStart(2, '0')}${value}`;

/** Returns an error message, or null if the text is a usable QR Ph payload. */
export function validateQrPh(payload: string): string | null {
  const p = payload.trim();
  if (!p.startsWith('000201'))
    return "This isn't a QR Ph code (the text should start with 000201).";

  let fields: Tlv[];
  try {
    fields = parseTlv(p);
  } catch {
    return 'The QR text is incomplete. Copy the whole text again.';
  }

  const last = fields[fields.length - 1];
  if (last?.tag !== '63' || last.value.length !== 4)
    return 'The QR text is missing its checksum (tag 63).';
  if (crc16(p.slice(0, -4)) !== last.value.toUpperCase())
    return "The checksum doesn't match. Copy the whole text again.";

  const hasAccount = fields.some(f => +f.tag >= 26 && +f.tag <= 51);
  if (!hasAccount) return 'No account information found in this QR.';

  return null;
}

/**
 * Turns a static QR Ph payload into a dynamic one with a fixed amount.
 * amount <= 0 returns the static payload (customer types the amount).
 * Throws if the static payload is invalid.
 */
export function buildDynamicQrPh(
  staticPayload: string,
  amount: number,
): string {
  const trimmed = staticPayload.trim();
  const error = validateQrPh(trimmed);
  if (error) throw new Error(error);
  if (!Number.isFinite(amount) || amount <= 0) return trimmed;

  const fields = parseTlv(trimmed).filter(
    f => f.tag !== '63' && f.tag !== '54', // drop old CRC + old amount
  );

  // 01 = point of initiation: 11 static, 12 dynamic
  const init = fields.find(f => f.tag === '01');
  if (init) init.value = '12';
  else fields.push({tag: '01', value: '12'});

  fields.push({tag: '54', value: (Math.round(amount * 100) / 100).toFixed(2)});
  fields.sort((a, b) => a.tag.localeCompare(b.tag));

  const body = fields.map(encodeTlv).join('') + '6304';
  return body + crc16(body);
}

export type QrPhAccount = {
  name: string; // GCash already masks this inside the QR, e.g. "KL**T DO****C S."
  city: string;
  userIdTail: string; // last 6 characters of the account's user ID
};

/** Display-only details read from the QR, for showing the owner which account is loaded. */
export function getQrPhAccount(payload: string): QrPhAccount | null {
  try {
    const fields = parseTlv(payload.trim());
    const get = (tag: string) => fields.find(f => f.tag === tag)?.value ?? '';
    const block = fields.find(f => +f.tag >= 26 && +f.tag <= 51);
    const inner = block ? parseTlv(block.value) : [];
    const userId = inner.find(f => f.tag === '04')?.value ?? '';
    return {name: get('59'), city: get('60'), userIdTail: userId.slice(-6)};
  } catch {
    return null;
  }
}
