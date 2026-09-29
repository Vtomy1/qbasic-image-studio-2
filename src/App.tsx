import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BitDepth,
  DitherType,
  ImageAdjustments,
  PalettePreset,
  ScreenModeDef,
  RgbColor,
} from './types/qbasic';
import { SCREEN_MODES } from './utils/screenModes';
import {
  PALETTE_PRESETS,
  STANDARD_VGA_256_PALETTE,
  extractAdaptive256Palette,
} from './utils/palettes';
import { SAMPLE_IMAGES, SampleImage } from './utils/sampleImages';
import { processDithering, DitherResult } from './utils/dithering';
import { encodeBsave, BsavePackage } from './utils/bsave';

import { Header } from './components/Header';
import { ImageControls } from './components/ImageControls';
import { ImageViewer } from './components/ImageViewer';
import { HexInspector } from './components/HexInspector';
import { CodeViewer } from './components/CodeViewer';
import { DownloadToolbar } from './components/DownloadToolbar';
import { CrtSimulator } from './components/CrtSimulator';
import { SpecsModal } from './components/SpecsModal';

export default function App() {
  // 1. Source image state
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(null);

  // 2. Format & Screen mode state
  const [selectedBitDepth, setSelectedBitDepth] = useState<BitDepth>('8-bit');
  const [selectedScreenMode, setSelectedScreenMode] = useState<ScreenModeDef>(SCREEN_MODES[0]); // Screen 13
  const [selectedPalettePreset, setSelectedPalettePreset] = useState<PalettePreset>(
    PALETTE_PRESETS.find((p) => p.id === '8bit_vga_standard') || PALETTE_PRESETS[0]
  );

  // 3. Dithering & Adjustments
  const [ditherType, setDitherType] = useState<DitherType>('floyd_steinberg');
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    gamma: 1.0,
    saturation: 100,
    invert: false,
    ditherStrength: 100,
    aspectMode: 'fit',
    correctAspectRatio: true,
  });

  // 4. Filename
  const [baseFilename, setBaseFilename] = useState<string>('RETRO');

  // 5. Processing outputs
  const [ditherResult, setDitherResult] = useState<DitherResult | null>(null);
  const [bsavePkg, setBsavePkg] = useState<BsavePackage | null>(null);

  // 6. Modals
  const [isCrtModalOpen, setIsCrtModalOpen] = useState<boolean>(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState<boolean>(false);

  // Initialize with Synthwave sample image on mount
  useEffect(() => {
    const synthwave = SAMPLE_IMAGES[0];
    if (synthwave) {
      const canvas = synthwave.generate();
      setSourceCanvas(canvas);
    }
  }, []);

  // Update mode when bit depth changes
  const handleSelectBitDepth = (bitDepth: BitDepth) => {
    setSelectedBitDepth(bitDepth);

    // Pick first matching screen mode
    const defaultMode = SCREEN_MODES.find((m) => m.bitDepth === bitDepth) || SCREEN_MODES[0];
    setSelectedScreenMode(defaultMode);

    // Pick first matching palette
    const defaultPalette = PALETTE_PRESETS.find((p) => p.bitDepth === bitDepth) || PALETTE_PRESETS[0];
    setSelectedPalettePreset(defaultPalette);
  };

  // Handle screen mode selection
  const handleSelectScreenMode = (mode: ScreenModeDef) => {
    setSelectedScreenMode(mode);
    if (mode.bitDepth !== selectedBitDepth && mode.id !== 'qb_array') {
      setSelectedBitDepth(mode.bitDepth);
      const defaultPalette = PALETTE_PRESETS.find((p) => p.bitDepth === mode.bitDepth) || PALETTE_PRESETS[0];
      setSelectedPalettePreset(defaultPalette);
    }
  };

  // Determine active palette colors
  const activePaletteColors = useMemo((): RgbColor[] => {
    if (selectedPalettePreset.id === '8bit_custom_optimized' && sourceCanvas) {
      // Generate adaptive palette based on source image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 160;
      tempCanvas.height = 100;
      const ctx = tempCanvas.getContext('2d')!;
      ctx.drawImage(sourceCanvas, 0, 0, 160, 100);
      const imgData = ctx.getImageData(0, 0, 160, 100);
      return extractAdaptive256Palette(imgData);
    }
    return selectedPalettePreset.colors;
  }, [selectedPalettePreset, sourceCanvas]);

  // Main processing pipeline
  useEffect(() => {
    if (!sourceCanvas) return;

    try {
      const res = processDithering(
        sourceCanvas,
        selectedScreenMode.width,
        selectedScreenMode.height,
        activePaletteColors,
        ditherType,
        adjustments
      );
      setDitherResult(res);

      const pkg = encodeBsave(res.indexedPixels, selectedScreenMode, baseFilename);
      setBsavePkg(pkg);
    } catch (err) {
      console.error('Error during image processing:', err);
    }
  }, [
    sourceCanvas,
    selectedScreenMode,
    activePaletteColors,
    ditherType,
    adjustments,
    baseFilename,
  ]);

  const handleToggleAspectRatio = () => {
    setAdjustments((prev) => ({
      ...prev,
      correctAspectRatio: !prev.correctAspectRatio,
    }));
  };

  const isCustomPalette = selectedPalettePreset.id === '8bit_custom_optimized';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
        onOpenCrtModal={() => setIsCrtModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Quick Screen Mode Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">Target Environment:</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
              {selectedScreenMode.name}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {selectedScreenMode.bitDepth}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              DEF SEG = {selectedScreenMode.segmentHex}
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              Dither: {ditherType.replace('_', ' ')}
            </span>
          </div>

          <div className="text-slate-400">
            BSAVE File: <span className="text-amber-400 font-bold">{bsavePkg?.filename || 'RETRO.BSV'}</span>{' '}
            ({bsavePkg?.fileBytes.length.toLocaleString() || 0} bytes)
          </div>
        </div>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Controls & Hex Inspector */}
          <div className="lg:col-span-5 space-y-6">
            <ImageControls
              selectedBitDepth={selectedBitDepth}
              onSelectBitDepth={handleSelectBitDepth}
              selectedScreenMode={selectedScreenMode}
              onSelectScreenMode={handleSelectScreenMode}
              selectedPalettePreset={selectedPalettePreset}
              onSelectPalettePreset={setSelectedPalettePreset}
              ditherType={ditherType}
              onChangeDitherType={setDitherType}
              adjustments={adjustments}
              onChangeAdjustments={setAdjustments}
              onLoadImage={(canvas) => setSourceCanvas(canvas)}
              onLoadSample={(sample) => setSourceCanvas(sample.generate())}
              baseFilename={baseFilename}
              onChangeBaseFilename={setBaseFilename}
            />

            {/* 7-Byte Header & Hex Inspector */}
            {bsavePkg && (
              <HexInspector
                header={bsavePkg.header}
                fileBytes={bsavePkg.fileBytes}
                screenMode={selectedScreenMode}
              />
            )}
          </div>

          {/* Right Column: Image Viewport, Downloads, and Code Viewer */}
          <div className="lg:col-span-7 space-y-6">
            {/* Retro Image Canvas Display */}
            <ImageViewer
              sourceCanvas={sourceCanvas}
              outputImageData={ditherResult?.outputImageData || null}
              palette={activePaletteColors}
              indexedPixels={ditherResult?.indexedPixels || null}
              screenMode={selectedScreenMode}
              correctAspectRatio={adjustments.correctAspectRatio}
              onToggleAspectRatio={handleToggleAspectRatio}
            />

            {/* Export & Download Bar */}
            <DownloadToolbar
              bsavePkg={bsavePkg}
              screenMode={selectedScreenMode}
              palette={activePaletteColors}
              isCustomPalette={isCustomPalette}
              outputImageData={ditherResult?.outputImageData || null}
            />

            {/* QBasic Saver & Loader Code Samples */}
            {bsavePkg && ditherResult && (
              <CodeViewer
                screenMode={selectedScreenMode}
                filename={bsavePkg.filename}
                palette={activePaletteColors}
                isCustomPalette={isCustomPalette}
                indexedPixels={ditherResult.indexedPixels}
              />
            )}
          </div>
        </div>
      </main>

      {/* CRT DOSBox Runner Modal */}
      <CrtSimulator
        isOpen={isCrtModalOpen}
        onClose={() => setIsCrtModalOpen(false)}
        outputImageData={ditherResult?.outputImageData || null}
        screenMode={selectedScreenMode}
        filename={bsavePkg?.filename || 'RETRO.BSV'}
      />

      {/* BSAVE Specification & Educational Reference Modal */}
      <SpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
      />

      {/* Retro Status Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-4 py-3 text-center text-xs font-mono text-slate-500">
        <div>
          Compatible with MS-DOS QBasic 1.1, QuickBASIC 4.5, GW-BASIC, DOSBox-X, and QB64-PE.
        </div>
        <div className="text-[11px] text-slate-600 mt-0.5">
          BSAVE Format Standard: 0xFD magic byte + 16-bit Segment + 16-bit Offset + 16-bit Length + Raw Video Payload.
        </div>
      </footer>
    </div>
  );
}
