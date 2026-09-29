import { BsaveHeaderInfo, ScreenModeDef } from '../types/qbasic';

export interface BsavePackage {
  header: BsaveHeaderInfo;
  payload: Uint8Array;
  fileBytes: Uint8Array;
  filename: string;
}

/**
 * Creates standard 7-byte QBasic BSAVE header:
 * Byte 0: 0xFD (Magic identifier)
 * Byte 1: Segment low byte
 * Byte 2: Segment high byte
 * Byte 3: Offset low byte
 * Byte 4: Offset high byte
 * Byte 5: Payload length low byte
 * Byte 6: Payload length high byte
 */
export function createBsaveHeader(
  segment: number,
  offset: number,
  payloadLength: number
): Uint8Array {
  const header = new Uint8Array(7);
  header[0] = 0xfd; // Magic identifier
  header[1] = segment & 0xff;
  header[2] = (segment >> 8) & 0xff;
  header[3] = offset & 0xff;
  header[4] = (offset >> 8) & 0xff;
  header[5] = payloadLength & 0xff;
  header[6] = (payloadLength >> 8) & 0xff;
  return header;
}

export function parseBsaveHeader(data: Uint8Array): BsaveHeaderInfo | null {
  if (data.length < 7 || data[0] !== 0xfd) {
    return null;
  }
  const segment = data[1] | (data[2] << 8);
  const offset = data[3] | (data[4] << 8);
  const payloadLength = data[5] | (data[6] << 8);
  const totalFileSize = data.length;

  return {
    magic: 0xfd,
    segment,
    offset,
    payloadLength,
    totalFileSize,
    segmentHex: '&H' + segment.toString(16).toUpperCase().padStart(4, '0'),
    offsetHex: '&H' + offset.toString(16).toUpperCase().padStart(4, '0'),
    lengthHex: '&H' + payloadLength.toString(16).toUpperCase().padStart(4, '0'),
  };
}

/**
 * Encode indexed pixels into BSAVE binary format according to the selected Screen Mode
 */
export function encodeBsave(
  indexedPixels: Uint8Array,
  screenMode: ScreenModeDef,
  baseFilename = 'IMAGE'
): BsavePackage {
  const { width, height, memoryLayout, segmentNumber, offsetNumber } = screenMode;
  let payload: Uint8Array;

  if (screenMode.id === 'screen13') {
    // 8-bit: SCREEN 13 (320x200, 256 colors linear)
    // 1 byte per pixel, exactly 64,000 bytes
    payload = new Uint8Array(width * height);
    payload.set(indexedPixels.subarray(0, width * height));
  } else if (screenMode.id === 'screen1') {
    // 2-bit: SCREEN 1 (320x200, 4 colors CGA interlaced)
    // 4 pixels per byte (bits 7-6, 5-4, 3-2, 1-0)
    // Bank 0 (even scanlines 0..198) = 8,000 bytes at offset 0
    // Bank 1 (odd scanlines 1..199) = 8,000 bytes at offset 8,192 (0x2000)
    payload = new Uint8Array(16192); // 8192 + 8000
    const bytesPerRow = width / 4; // 80 bytes

    for (let y = 0; y < height; y++) {
      const isOdd = y % 2 === 1;
      const bankOffset = isOdd ? 8192 : 0;
      const bankRow = Math.floor(y / 2);
      const rowStart = bankOffset + bankRow * bytesPerRow;

      for (let x = 0; x < width; x += 4) {
        const p0 = indexedPixels[y * width + x] & 3;
        const p1 = indexedPixels[y * width + x + 1] & 3;
        const p2 = indexedPixels[y * width + x + 2] & 3;
        const p3 = indexedPixels[y * width + x + 3] & 3;

        const byteVal = (p0 << 6) | (p1 << 4) | (p2 << 2) | p3;
        payload[rowStart + x / 4] = byteVal;
      }
    }
  } else if (screenMode.id === 'screen2') {
    // 1-bit: SCREEN 2 (640x200 CGA monochrome interlaced)
    // 8 pixels per byte (MSB first)
    // Bank 0 (even lines) at 0, Bank 1 (odd lines) at 8192
    payload = new Uint8Array(16192);
    const bytesPerRow = width / 8; // 80 bytes

    for (let y = 0; y < height; y++) {
      const isOdd = y % 2 === 1;
      const bankOffset = isOdd ? 8192 : 0;
      const bankRow = Math.floor(y / 2);
      const rowStart = bankOffset + bankRow * bytesPerRow;

      for (let x = 0; x < width; x += 8) {
        let byteVal = 0;
        for (let b = 0; b < 8; b++) {
          if (indexedPixels[y * width + x + b] > 0) {
            byteVal |= 1 << (7 - b);
          }
        }
        payload[rowStart + x / 8] = byteVal;
      }
    }
  } else if (screenMode.id === 'screen11') {
    // 1-bit: SCREEN 11 (640x480 VGA monochrome linear)
    // 8 pixels per byte (MSB first), 80 bytes per row * 480 = 38,400 bytes
    payload = new Uint8Array(width * height / 8);
    const bytesPerRow = width / 8; // 80 bytes

    for (let y = 0; y < height; y++) {
      const rowStart = y * bytesPerRow;
      for (let x = 0; x < width; x += 8) {
        let byteVal = 0;
        for (let b = 0; b < 8; b++) {
          if (indexedPixels[y * width + x + b] > 0) {
            byteVal |= 1 << (7 - b);
          }
        }
        payload[rowStart + x / 8] = byteVal;
      }
    }
  } else if (screenMode.id === 'screen7') {
    // 4-bit: SCREEN 7 (320x200 EGA 16 colors Planar)
    // 4 bitplanes (Blue, Green, Red, Intensity)
    // Each plane has 320/8 = 40 bytes per row * 200 rows = 8,000 bytes
    // Total 32,000 bytes
    payload = new Uint8Array(32000);
    const planeSize = 8000;
    const bytesPerRow = 40;

    for (let plane = 0; plane < 4; plane++) {
      const planeStart = plane * planeSize;
      const planeMask = 1 << plane;

      for (let y = 0; y < height; y++) {
        const rowStart = planeStart + y * bytesPerRow;
        for (let x = 0; x < width; x += 8) {
          let byteVal = 0;
          for (let b = 0; b < 8; b++) {
            const pixelColor = indexedPixels[y * width + x + b];
            if ((pixelColor & planeMask) !== 0) {
              byteVal |= 1 << (7 - b);
            }
          }
          payload[rowStart + x / 8] = byteVal;
        }
      }
    }
  } else if (screenMode.id === 'screen12') {
    // 4-bit: SCREEN 12 (640x480 VGA 16 colors Planar)
    // 4 planes of 38,400 bytes each = 153,600 bytes
    payload = new Uint8Array(153600);
    const planeSize = 38400;
    const bytesPerRow = 80;

    for (let plane = 0; plane < 4; plane++) {
      const planeStart = plane * planeSize;
      const planeMask = 1 << plane;

      for (let y = 0; y < height; y++) {
        const rowStart = planeStart + y * bytesPerRow;
        for (let x = 0; x < width; x += 8) {
          let byteVal = 0;
          for (let b = 0; b < 8; b++) {
            const pixelColor = indexedPixels[y * width + x + b];
            if ((pixelColor & planeMask) !== 0) {
              byteVal |= 1 << (7 - b);
            }
          }
          payload[rowStart + x / 8] = byteVal;
        }
      }
    }
  } else {
    // qb_array: QBasic PUT/GET integer array format
    // Header: Word 0 = width in bits (320 * 8 = 2560), Word 1 = height (200)
    // Followed by raw pixel data
    payload = new Uint8Array(4 + width * height);
    const widthBits = width * 8;
    payload[0] = widthBits & 0xff;
    payload[1] = (widthBits >> 8) & 0xff;
    payload[2] = height & 0xff;
    payload[3] = (height >> 8) & 0xff;
    payload.set(indexedPixels.subarray(0, width * height), 4);
  }

  // Generate 7-byte header
  const rawHeader = createBsaveHeader(segmentNumber, offsetNumber, payload.length);

  // Combine header + payload
  const fileBytes = new Uint8Array(7 + payload.length);
  fileBytes.set(rawHeader, 0);
  fileBytes.set(payload, 7);

  const headerInfo: BsaveHeaderInfo = {
    magic: 0xfd,
    segment: segmentNumber,
    offset: offsetNumber,
    payloadLength: payload.length,
    totalFileSize: fileBytes.length,
    segmentHex: screenMode.segmentHex,
    offsetHex: screenMode.offsetHex,
    lengthHex: '&H' + (payload.length & 0xffff).toString(16).toUpperCase().padStart(4, '0'),
  };

  const filename = `${baseFilename.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase() || 'IMAGE'}.BSV`;

  return {
    header: headerInfo,
    payload,
    fileBytes,
    filename,
  };
}

/**
 * Creates 768-byte VGA Palette file (.PAL)
 * 256 colors x 3 channels (R, G, B) scaled to 0-63 (VGA DAC 6-bit registers)
 */
export function createVgaPaletteFile(palette: { r: number; g: number; b: number }[]): Uint8Array {
  const palBytes = new Uint8Array(768);
  for (let i = 0; i < 256; i++) {
    const col = palette[i] || { r: 0, g: 0, b: 0 };
    // VGA DAC expects 6-bit values (0..63)
    palBytes[i * 3] = Math.floor((col.r / 255) * 63);
    palBytes[i * 3 + 1] = Math.floor((col.g / 255) * 63);
    palBytes[i * 3 + 2] = Math.floor((col.b / 255) * 63);
  }
  return palBytes;
}
