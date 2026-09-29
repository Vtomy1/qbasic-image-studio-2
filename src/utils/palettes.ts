import { PalettePreset, RgbColor, BitDepth } from '../types/qbasic';

// Standard EGA/VGA 16-Color Palette (QBasic colors 0 to 15)
export const EGA_VGA_16_COLORS: RgbColor[] = [
  { r: 0, g: 0, b: 0, name: '0: Black', qbasicIndex: 0 },
  { r: 0, g: 0, b: 170, name: '1: Blue', qbasicIndex: 1 },
  { r: 0, g: 170, b: 0, name: '2: Green', qbasicIndex: 2 },
  { r: 0, g: 170, b: 170, name: '3: Cyan', qbasicIndex: 3 },
  { r: 170, g: 0, b: 0, name: '4: Red', qbasicIndex: 4 },
  { r: 170, g: 0, b: 170, name: '5: Magenta', qbasicIndex: 5 },
  { r: 170, g: 85, b: 0, name: '6: Brown', qbasicIndex: 6 },
  { r: 170, g: 170, b: 170, name: '7: White / Light Gray', qbasicIndex: 7 },
  { r: 85, g: 85, b: 85, name: '8: Dark Gray', qbasicIndex: 8 },
  { r: 85, g: 85, b: 255, name: '9: Bright Blue', qbasicIndex: 9 },
  { r: 85, g: 255, b: 85, name: '10: Bright Green', qbasicIndex: 10 },
  { r: 85, g: 255, b: 255, name: '11: Bright Cyan', qbasicIndex: 11 },
  { r: 255, g: 85, b: 85, name: '12: Bright Red', qbasicIndex: 12 },
  { r: 255, g: 85, b: 255, name: '13: Bright Magenta', qbasicIndex: 13 },
  { r: 255, g: 255, b: 85, name: '14: Yellow', qbasicIndex: 14 },
  { r: 255, g: 255, b: 255, name: '15: High Intensity White', qbasicIndex: 15 },
];

// CGA Palette 0 (Low Intensity: Black, Green, Red, Brown)
export const CGA_PALETTE_0_LOW: RgbColor[] = [
  { r: 0, g: 0, b: 0, name: 'Black', qbasicIndex: 0 },
  { r: 0, g: 170, b: 0, name: 'Green', qbasicIndex: 1 },
  { r: 170, g: 0, b: 0, name: 'Red', qbasicIndex: 2 },
  { r: 170, g: 85, b: 0, name: 'Brown', qbasicIndex: 3 },
];

// CGA Palette 0 (High Intensity: Black, Light Green, Light Red, Yellow)
export const CGA_PALETTE_0_HIGH: RgbColor[] = [
  { r: 0, g: 0, b: 0, name: 'Black', qbasicIndex: 0 },
  { r: 85, g: 255, b: 85, name: 'Light Green', qbasicIndex: 1 },
  { r: 255, g: 85, b: 85, name: 'Light Red', qbasicIndex: 2 },
  { r: 255, g: 255, b: 85, name: 'Yellow', qbasicIndex: 3 },
];

// CGA Palette 1 (Low Intensity: Black, Cyan, Magenta, Light Gray)
export const CGA_PALETTE_1_LOW: RgbColor[] = [
  { r: 0, g: 0, b: 0, name: 'Black', qbasicIndex: 0 },
  { r: 0, g: 170, b: 170, name: 'Cyan', qbasicIndex: 1 },
  { r: 170, g: 0, b: 170, name: 'Magenta', qbasicIndex: 2 },
  { r: 170, g: 170, b: 170, name: 'Light Gray', qbasicIndex: 3 },
];

// CGA Palette 1 (High Intensity: Black, Light Cyan, Light Magenta, Bright White)
export const CGA_PALETTE_1_HIGH: RgbColor[] = [
  { r: 0, g: 0, b: 0, name: 'Black', qbasicIndex: 0 },
  { r: 85, g: 255, b: 255, name: 'Light Cyan', qbasicIndex: 1 },
  { r: 255, g: 85, b: 255, name: 'Light Magenta', qbasicIndex: 2 },
  { r: 255, g: 255, b: 255, name: 'Bright White', qbasicIndex: 3 },
];

// Commodore 64 16 colors
export const C64_16_COLORS: RgbColor[] = [
  { r: 0, g: 0, b: 0, name: 'Black' },
  { r: 255, g: 255, b: 255, name: 'White' },
  { r: 136, g: 0, b: 0, name: 'Red' },
  { r: 170, g: 255, b: 238, name: 'Cyan' },
  { r: 204, g: 68, b: 204, name: 'Purple' },
  { r: 0, g: 204, b: 85, name: 'Green' },
  { r: 0, g: 0, b: 170, name: 'Blue' },
  { r: 238, g: 238, b: 119, name: 'Yellow' },
  { r: 221, g: 136, b: 85, name: 'Orange' },
  { r: 102, g: 68, b: 0, name: 'Brown' },
  { r: 255, g: 119, b: 119, name: 'Light Red' },
  { r: 51, g: 51, b: 51, name: 'Dark Grey' },
  { r: 119, g: 119, b: 119, name: 'Grey' },
  { r: 170, g: 255, b: 102, name: 'Light Green' },
  { r: 0, g: 136, b: 255, name: 'Light Blue' },
  { r: 187, g: 187, b: 187, name: 'Light Grey' },
];

// Game Boy 4 shades
export const GAMEBOY_4_COLORS: RgbColor[] = [
  { r: 15, g: 56, b: 15, name: 'Darkest Green' },
  { r: 48, g: 98, b: 48, name: 'Dark Green' },
  { r: 139, g: 172, b: 15, name: 'Light Green' },
  { r: 155, g: 188, b: 15, name: 'Lightest Green' },
];

// Standard VGA 256 Color Mode 13h BIOS Palette
export function generateStandardVga256Palette(): RgbColor[] {
  const palette: RgbColor[] = [];
  
  // 0-15: Standard 16 colors (same as EGA/VGA 16)
  for (let i = 0; i < 16; i++) {
    palette.push({ ...EGA_VGA_16_COLORS[i], qbasicIndex: i });
  }

  // 16-31: 16 shades of gray ramp
  for (let i = 0; i < 16; i++) {
    const val = Math.round((i / 15) * 255);
    palette.push({ r: val, g: val, b: val, name: `Gray ${i}`, qbasicIndex: 16 + i });
  }

  // 32-247: Standard 216 color ramp (24 hues at 3 saturation levels with 3 brightness levels)
  // VGA Mode 13h DAC BIOS formula:
  const hues = 24;
  for (let sat = 0; sat < 3; sat++) {
    for (let lum = 0; lum < 3; lum++) {
      for (let h = 0; h < hues; h++) {
        if (palette.length >= 248) break;
        const hueAngle = (h / hues) * 360;
        const s = sat === 0 ? 1.0 : sat === 1 ? 0.6 : 0.35;
        const l = lum === 0 ? 0.5 : lum === 1 ? 0.3 : 0.75;
        const rgb = hslToRgb(hueAngle, s, l);
        palette.push({
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          name: `VGA Color ${palette.length}`,
          qbasicIndex: palette.length,
        });
      }
    }
  }

  // Fill remaining 248-255 with extra black/grayscale to hit exactly 256
  while (palette.length < 256) {
    const idx = palette.length;
    const v = Math.round(((idx - 248) / 7) * 255);
    palette.push({ r: v, g: v, b: v, name: `Reserved ${idx}`, qbasicIndex: idx });
  }

  return palette.slice(0, 256);
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = (h % 360) / 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export const STANDARD_VGA_256_PALETTE = generateStandardVga256Palette();

export const PALETTE_PRESETS: PalettePreset[] = [
  // 1-Bit Palettes
  {
    id: '1bit_mono',
    name: 'B&W Monochrome (VGA / Hercules)',
    bitDepth: '1-bit',
    description: 'Crisp black & white 1-bit high contrast standard.',
    colors: [
      { r: 0, g: 0, b: 0, name: '0: Black', qbasicIndex: 0 },
      { r: 255, g: 255, b: 255, name: '1: White', qbasicIndex: 1 },
    ],
  },
  {
    id: '1bit_green',
    name: 'P1 Green Phosphor CRT',
    bitDepth: '1-bit',
    description: 'Iconic monochrome green terminal phosphor glow.',
    colors: [
      { r: 0, g: 0, b: 0, name: '0: Black', qbasicIndex: 0 },
      { r: 51, g: 255, b: 51, name: '1: Green Phosphor', qbasicIndex: 1 },
    ],
  },
  {
    id: '1bit_amber',
    name: 'P3 Amber Phosphor CRT',
    bitDepth: '1-bit',
    description: 'Warm glowing amber monochrome IBM / Wyse terminal.',
    colors: [
      { r: 0, g: 0, b: 0, name: '0: Black', qbasicIndex: 0 },
      { r: 255, g: 176, b: 0, name: '1: Amber Phosphor', qbasicIndex: 1 },
    ],
  },

  // 2-Bit Palettes (CGA 4-Color)
  {
    id: '2bit_cga1_high',
    name: 'CGA Palette 1 (High Intensity)',
    bitDepth: '2-bit',
    description: 'Cyan, Light Magenta, Bright White, Black (The classic DOS game look).',
    colors: CGA_PALETTE_1_HIGH,
  },
  {
    id: '2bit_cga1_low',
    name: 'CGA Palette 1 (Low Intensity)',
    bitDepth: '2-bit',
    description: 'Cyan, Magenta, Light Gray, Black.',
    colors: CGA_PALETTE_1_LOW,
  },
  {
    id: '2bit_cga0_high',
    name: 'CGA Palette 0 (High Intensity)',
    bitDepth: '2-bit',
    description: 'Light Green, Light Red, Yellow, Black.',
    colors: CGA_PALETTE_0_HIGH,
  },
  {
    id: '2bit_cga0_low',
    name: 'CGA Palette 0 (Low Intensity)',
    bitDepth: '2-bit',
    description: 'Green, Red, Brown, Black.',
    colors: CGA_PALETTE_0_LOW,
  },
  {
    id: '2bit_gameboy',
    name: 'Game Boy 4-Green Shade',
    bitDepth: '2-bit',
    description: 'Original handheld 4-shade greenish LCD matrix.',
    colors: GAMEBOY_4_COLORS,
  },

  // 4-Bit Palettes (16-Color)
  {
    id: '4bit_ega_vga',
    name: 'IBM PC / EGA / VGA 16 Colors (Default)',
    bitDepth: '4-bit',
    description: 'Standard QBasic Colors 0 through 15 across SCREEN 7, 9, 12.',
    colors: EGA_VGA_16_COLORS,
  },
  {
    id: '4bit_c64',
    name: 'Commodore 64 16 Colors',
    bitDepth: '4-bit',
    description: 'Warm, muted palette from the legendary 8-bit computer.',
    colors: C64_16_COLORS,
  },

  // 8-Bit Palettes (256-Color)
  {
    id: '8bit_vga_standard',
    name: 'Standard VGA Mode 13h (256 Colors)',
    bitDepth: '8-bit',
    description: 'Hardware BIOS default 256 colors for SCREEN 13 (no custom palette needed).',
    colors: STANDARD_VGA_256_PALETTE,
  },
  {
    id: '8bit_custom_optimized',
    name: 'Custom Adaptive 256 Colors (Generated with .PAL)',
    bitDepth: '8-bit',
    description: 'Extracted directly from image for true photo-realistic quality. Generates QBasic OUT &H3C8 palette code.',
    colors: STANDARD_VGA_256_PALETTE, // Will be overridden dynamically per image
  },
];

// Helper to quantize an image and generate an adaptive 256 color palette using median-cut / color clustering
export function extractAdaptive256Palette(imageData: ImageData): RgbColor[] {
  const data = imageData.data;
  const colorMap = new Map<number, number>();

  // Sample pixels (every 2-4 pixels to keep it fast while representative)
  const step = Math.max(1, Math.floor(data.length / (320 * 200 * 4)));
  for (let i = 0; i < data.length; i += 4 * step) {
    if (data[i + 3] < 32) continue; // skip transparent
    // Reduce 5-bit color space for fast clustering
    const r5 = data[i] >> 3;
    const g5 = data[i + 1] >> 3;
    const b5 = data[i + 2] >> 3;
    const key = (r5 << 10) | (g5 << 5) | b5;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Sort by frequency
  const sorted = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1]);

  const palette: RgbColor[] = [];
  // Ensure black is always color 0
  palette.push({ r: 0, g: 0, b: 0, name: 'Background Black', qbasicIndex: 0 });

  const targetCount = 256;
  const pickedKeys = new Set<number>();
  pickedKeys.add(0);

  // Take top colors with minimum Euclidean distance
  for (const [key] of sorted) {
    if (palette.length >= targetCount) break;
    const r = ((key >> 10) & 31) << 3;
    const g = ((key >> 5) & 31) << 3;
    const b = (key & 31) << 3;

    // Check distance to existing palette colors
    let tooClose = false;
    for (let j = 0; j < palette.length; j++) {
      const dr = r - palette[j].r;
      const dg = g - palette[j].g;
      const db = b - palette[j].b;
      if (dr * dr + dg * dg + db * db < 64) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose || palette.length + (sorted.length - pickedKeys.size) <= targetCount) {
      palette.push({ r, g, b, name: `Color ${palette.length}`, qbasicIndex: palette.length });
      pickedKeys.add(key);
    }
  }

  // If still less than 256, fill from remaining or standard VGA
  let idx = 0;
  while (palette.length < 256) {
    const vgaColor = STANDARD_VGA_256_PALETTE[idx % STANDARD_VGA_256_PALETTE.length];
    palette.push({
      r: vgaColor.r,
      g: vgaColor.g,
      b: vgaColor.b,
      name: `Fallback ${palette.length}`,
      qbasicIndex: palette.length,
    });
    idx++;
  }

  return palette.slice(0, 256);
}
