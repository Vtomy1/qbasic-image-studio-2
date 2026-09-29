import { DitherType, ImageAdjustments, RgbColor } from '../types/qbasic';

// Bayer Matrices for Ordered Dithering
const BAYER_2X2 = [
  [0, 2],
  [3, 1],
];

const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

// Perceptual color distance (Redmean metric for human visual perception)
export function colorDistanceSquared(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const rmean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return (
    (((512 + rmean) * dr * dr) >> 8) +
    4 * dg * dg +
    (((767 - rmean) * db * db) >> 8)
  );
}

// Find closest palette index
export function findClosestPaletteIndex(
  r: number,
  g: number,
  b: number,
  palette: RgbColor[]
): number {
  let bestDist = Infinity;
  let bestIndex = 0;

  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    const dist = colorDistanceSquared(r, g, b, p.r, p.g, p.b);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
      if (dist === 0) break; // exact match
    }
  }

  return bestIndex;
}

// Apply pre-processing adjustments (brightness, contrast, gamma, saturation, invert)
export function applyAdjustments(
  r: number,
  g: number,
  b: number,
  adj: ImageAdjustments
): [number, number, number] {
  // Invert
  if (adj.invert) {
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
  }

  // Brightness (-100 to 100)
  if (adj.brightness !== 0) {
    const factor = adj.brightness * 2.55;
    r += factor;
    g += factor;
    b += factor;
  }

  // Contrast (-100 to 100)
  if (adj.contrast !== 0) {
    const factor = (259 * (adj.contrast + 100)) / (100 * (259 - adj.contrast));
    r = factor * (r - 128) + 128;
    g = factor * (g - 128) + 128;
    b = factor * (b - 128) + 128;
  }

  // Saturation (0 to 200%)
  if (adj.saturation !== 100) {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = adj.saturation / 100;
    r = gray + (r - gray) * sat;
    g = gray + (g - gray) * sat;
    b = gray + (b - gray) * sat;
  }

  // Gamma (0.2 to 3.0)
  if (adj.gamma !== 1.0 && adj.gamma > 0) {
    const invGamma = 1 / adj.gamma;
    r = 255 * Math.pow(Math.max(0, Math.min(255, r)) / 255, invGamma);
    g = 255 * Math.pow(Math.max(0, Math.min(255, g)) / 255, invGamma);
    b = 255 * Math.pow(Math.max(0, Math.min(255, b)) / 255, invGamma);
  }

  return [
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b)),
  ];
}

export interface DitherResult {
  indexedPixels: Uint8Array; // Palette indices for each pixel (width * height)
  outputImageData: ImageData; // Renderable RGBA ImageData for canvas
  palette: RgbColor[];
  width: number;
  height: number;
}

export function processDithering(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  palette: RgbColor[],
  ditherType: DitherType,
  adjustments: ImageAdjustments
): DitherResult {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;

  // Aspect Ratio & Scaling
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';

  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;

  tempCtx.fillStyle = '#000000';
  tempCtx.fillRect(0, 0, targetWidth, targetHeight);

  if (adjustments.aspectMode === 'stretch') {
    tempCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
  } else if (adjustments.aspectMode === 'fit') {
    const scale = Math.min(targetWidth / srcW, targetHeight / srcH);
    const drawW = Math.round(srcW * scale);
    const drawH = Math.round(srcH * scale);
    const drawX = Math.round((targetWidth - drawW) / 2);
    const drawY = Math.round((targetHeight - drawH) / 2);
    tempCtx.drawImage(sourceCanvas, drawX, drawY, drawW, drawH);
  } else {
    // Fill / Crop
    const scale = Math.max(targetWidth / srcW, targetHeight / srcH);
    const drawW = Math.round(srcW * scale);
    const drawH = Math.round(srcH * scale);
    const drawX = Math.round((targetWidth - drawW) / 2);
    const drawY = Math.round((targetHeight - drawH) / 2);
    tempCtx.drawImage(sourceCanvas, drawX, drawY, drawW, drawH);
  }

  const srcImageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
  const srcData = srcImageData.data;

  // Working buffers for float RGB with error accumulation
  const rBuf = new Float32Array(targetWidth * targetHeight);
  const gBuf = new Float32Array(targetWidth * targetHeight);
  const bBuf = new Float32Array(targetWidth * targetHeight);

  // Apply initial color adjustments into float buffers
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4;
      const [ar, ag, ab] = applyAdjustments(
        srcData[idx],
        srcData[idx + 1],
        srcData[idx + 2],
        adjustments
      );
      const bIdx = y * targetWidth + x;
      rBuf[bIdx] = ar;
      gBuf[bIdx] = ag;
      bBuf[bIdx] = ab;
    }
  }

  const indexedPixels = new Uint8Array(targetWidth * targetHeight);
  const outputImageData = tempCtx.createImageData(targetWidth, targetHeight);
  const outData = outputImageData.data;

  const strength = adjustments.ditherStrength / 100;

  // 1. ORDERED / BAYER DITHERING
  if (
    ditherType === 'bayer_2x2' ||
    ditherType === 'bayer_4x4' ||
    ditherType === 'bayer_8x8'
  ) {
    let bayerMatrix: number[][];
    let matrixSize: number;

    if (ditherType === 'bayer_2x2') {
      bayerMatrix = BAYER_2X2;
      matrixSize = 2;
    } else if (ditherType === 'bayer_4x4') {
      bayerMatrix = BAYER_4X4;
      matrixSize = 4;
    } else {
      bayerMatrix = BAYER_8X8;
      matrixSize = 8;
    }

    const maxVal = matrixSize * matrixSize;
    // Spread threshold factor
    const spread = (64 * strength);

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const i = y * targetWidth + x;
        const bayerVal = bayerMatrix[y % matrixSize][x % matrixSize];
        const offset = ((bayerVal / maxVal) - 0.5) * spread;

        const r = Math.max(0, Math.min(255, rBuf[i] + offset));
        const g = Math.max(0, Math.min(255, gBuf[i] + offset));
        const b = Math.max(0, Math.min(255, bBuf[i] + offset));

        const paletteIdx = findClosestPaletteIndex(r, g, b, palette);
        indexedPixels[i] = paletteIdx;

        const chosen = palette[paletteIdx];
        const oIdx = i * 4;
        outData[oIdx] = chosen.r;
        outData[oIdx + 1] = chosen.g;
        outData[oIdx + 2] = chosen.b;
        outData[oIdx + 3] = 255;
      }
    }

    return {
      indexedPixels,
      outputImageData,
      palette,
      width: targetWidth,
      height: targetHeight,
    };
  }

  // 2. ERROR DIFFUSION DITHERING (Floyd-Steinberg, Atkinson, Sierra, etc.) OR NONE
  for (let y = 0; y < targetHeight; y++) {
    // Serpentine scan for reduced directional artifacting
    const leftToRight = y % 2 === 0;
    const startX = leftToRight ? 0 : targetWidth - 1;
    const endX = leftToRight ? targetWidth : -1;
    const stepX = leftToRight ? 1 : -1;

    for (let x = startX; x !== endX; x += stepX) {
      const i = y * targetWidth + x;
      const curR = Math.max(0, Math.min(255, rBuf[i]));
      const curG = Math.max(0, Math.min(255, gBuf[i]));
      const curB = Math.max(0, Math.min(255, bBuf[i]));

      const paletteIdx = findClosestPaletteIndex(curR, curG, curB, palette);
      indexedPixels[i] = paletteIdx;

      const chosen = palette[paletteIdx];
      const oIdx = i * 4;
      outData[oIdx] = chosen.r;
      outData[oIdx + 1] = chosen.g;
      outData[oIdx + 2] = chosen.b;
      outData[oIdx + 3] = 255;

      if (ditherType === 'none' || strength === 0) {
        continue;
      }

      // Calculate Quantization Error
      const errR = (curR - chosen.r) * strength;
      const errG = (curG - chosen.g) * strength;
      const errB = (curB - chosen.b) * strength;

      const distribute = (dx: number, dy: number, factor: number) => {
        const nx = x + (leftToRight ? dx : -dx);
        const ny = y + dy;
        if (nx >= 0 && nx < targetWidth && ny >= 0 && ny < targetHeight) {
          const nIdx = ny * targetWidth + nx;
          rBuf[nIdx] += errR * factor;
          gBuf[nIdx] += errG * factor;
          bBuf[nIdx] += errB * factor;
        }
      };

      if (ditherType === 'floyd_steinberg') {
        distribute(1, 0, 7 / 16);
        distribute(-1, 1, 3 / 16);
        distribute(0, 1, 5 / 16);
        distribute(1, 1, 1 / 16);
      } else if (ditherType === 'atkinson') {
        // Atkinson spreads 1/8 each to 6 neighbors (retains 2/8 for high contrast)
        distribute(1, 0, 1 / 8);
        distribute(2, 0, 1 / 8);
        distribute(-1, 1, 1 / 8);
        distribute(0, 1, 1 / 8);
        distribute(1, 1, 1 / 8);
        distribute(0, 2, 1 / 8);
      } else if (ditherType === 'sierra') {
        distribute(1, 0, 5 / 32);
        distribute(2, 0, 3 / 32);
        distribute(-2, 1, 2 / 32);
        distribute(-1, 1, 4 / 32);
        distribute(0, 1, 5 / 32);
        distribute(1, 1, 4 / 32);
        distribute(2, 1, 2 / 32);
        distribute(-1, 2, 2 / 32);
        distribute(0, 2, 3 / 32);
        distribute(1, 2, 2 / 32);
      } else if (ditherType === 'stucki') {
        distribute(1, 0, 8 / 42);
        distribute(2, 0, 4 / 42);
        distribute(-2, 1, 2 / 42);
        distribute(-1, 1, 4 / 42);
        distribute(0, 1, 8 / 42);
        distribute(1, 1, 4 / 42);
        distribute(2, 1, 2 / 42);
        distribute(-2, 2, 1 / 42);
        distribute(-1, 2, 2 / 42);
        distribute(0, 2, 4 / 42);
        distribute(1, 2, 2 / 42);
        distribute(2, 2, 1 / 42);
      } else if (ditherType === 'burkes') {
        distribute(1, 0, 8 / 32);
        distribute(2, 0, 4 / 32);
        distribute(-2, 1, 2 / 32);
        distribute(-1, 1, 4 / 32);
        distribute(0, 1, 8 / 32);
        distribute(1, 1, 4 / 32);
        distribute(2, 1, 2 / 32);
      }
    }
  }

  return {
    indexedPixels,
    outputImageData,
    palette,
    width: targetWidth,
    height: targetHeight,
  };
}
