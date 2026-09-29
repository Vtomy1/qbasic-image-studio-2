export type BitDepth = '1-bit' | '2-bit' | '4-bit' | '8-bit';

export type ScreenModeId = 
  | 'screen11'   // 1-bit: 640x480 VGA monochrome, &HA000
  | 'screen2'    // 1-bit: 640x200 CGA monochrome interlaced, &HB800
  | 'screen1'    // 2-bit: 320x200 CGA 4 colors interlaced, &HB800
  | 'screen7'    // 4-bit: 320x200 EGA 16 colors planar, &HA000
  | 'screen12'   // 4-bit: 640x480 VGA 16 colors planar, &HA000
  | 'screen13'   // 8-bit: 320x200 VGA 256 colors linear, &HA000
  | 'qb_array';  // QBasic GET/PUT Integer Array format (variable size)

export interface ScreenModeDef {
  id: ScreenModeId;
  name: string;
  bitDepth: BitDepth;
  width: number;
  height: number;
  colors: number;
  segmentHex: string;
  segmentNumber: number;
  offsetHex: string;
  offsetNumber: number;
  description: string;
  memoryLayout: 'linear' | 'cga_interlaced' | 'planar' | 'array';
  payloadBytes: number;
}

export type DitherType = 
  | 'none'
  | 'floyd_steinberg'
  | 'atkinson'
  | 'bayer_2x2'
  | 'bayer_4x4'
  | 'bayer_8x8'
  | 'sierra'
  | 'stucki'
  | 'burkes';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
  name?: string;
  qbasicIndex?: number;
}

export interface PalettePreset {
  id: string;
  name: string;
  bitDepth: BitDepth;
  colors: RgbColor[];
  description: string;
}

export interface BsaveHeaderInfo {
  magic: number;         // Always 0xFD (253)
  segment: number;       // e.g. 0xA000 or 0xB800
  offset: number;        // e.g. 0x0000
  payloadLength: number; // File size - 7
  totalFileSize: number; // payloadLength + 7
  segmentHex: string;
  offsetHex: string;
  lengthHex: string;
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  gamma: number;      // 0.2 to 3.0
  saturation: number; // 0 to 200
  invert: boolean;
  ditherStrength: number; // 0 to 150
  aspectMode: 'fit' | 'fill' | 'stretch';
  correctAspectRatio: boolean; // 4:3 CRT pixel aspect correction
}
