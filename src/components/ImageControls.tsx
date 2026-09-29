import React, { useRef } from 'react';
import {
  BitDepth,
  DitherType,
  ImageAdjustments,
  PalettePreset,
  ScreenModeDef,
} from '../types/qbasic';
import { SCREEN_MODES } from '../utils/screenModes';
import { PALETTE_PRESETS } from '../utils/palettes';
import { SAMPLE_IMAGES, SampleImage } from '../utils/sampleImages';
import {
  Upload,
  Sliders,
  Sparkles,
  Palette,
  Image as ImageIcon,
  RotateCcw,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface ImageControlsProps {
  selectedBitDepth: BitDepth;
  onSelectBitDepth: (bitDepth: BitDepth) => void;
  selectedScreenMode: ScreenModeDef;
  onSelectScreenMode: (mode: ScreenModeDef) => void;
  selectedPalettePreset: PalettePreset;
  onSelectPalettePreset: (preset: PalettePreset) => void;
  ditherType: DitherType;
  onChangeDitherType: (type: DitherType) => void;
  adjustments: ImageAdjustments;
  onChangeAdjustments: (adjustments: ImageAdjustments) => void;
  onLoadImage: (canvas: HTMLCanvasElement) => void;
  onLoadSample: (sample: SampleImage) => void;
  baseFilename: string;
  onChangeBaseFilename: (name: string) => void;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  selectedBitDepth,
  onSelectBitDepth,
  selectedScreenMode,
  onSelectScreenMode,
  selectedPalettePreset,
  onSelectPalettePreset,
  ditherType,
  onChangeDitherType,
  adjustments,
  onChangeAdjustments,
  onLoadImage,
  onLoadSample,
  baseFilename,
  onChangeBaseFilename,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter modes that match current bit depth
  const availableModes = SCREEN_MODES.filter(
    (m) => m.bitDepth === selectedBitDepth || m.id === 'qb_array'
  );

  // Filter palette presets for current bit depth
  const availablePalettes = PALETTE_PRESETS.filter(
    (p) => p.bitDepth === selectedBitDepth
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use filename (without extension) as baseFilename
    const rawName = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
    onChangeBaseFilename(rawName.slice(0, 8)); // 8.3 filename

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        onLoadImage(canvas);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetAdjustments = () => {
    onChangeAdjustments({
      brightness: 0,
      contrast: 0,
      gamma: 1.0,
      saturation: 100,
      invert: false,
      ditherStrength: 100,
      aspectMode: 'fit',
      correctAspectRatio: true,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-5">
      {/* 1. Image Source & Sample Picker */}
      <div>
        <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Image Source
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-w-[140px] px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>

          <div className="flex items-center space-x-1 w-full sm:w-auto mt-1 sm:mt-0">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onLoadSample(sample)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors flex-1 sm:flex-initial text-center border border-slate-700/80"
                title={sample.description}
              >
                {sample.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Bit Depth Selector Tabs */}
      <div>
        <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Target Bit Depth
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
          {(['1-bit', '2-bit', '4-bit', '8-bit'] as BitDepth[]).map((b) => (
            <button
              key={b}
              onClick={() => onSelectBitDepth(b)}
              className={`py-2 px-2 rounded-md transition-all font-semibold flex flex-col items-center justify-center ${
                selectedBitDepth === b
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{b}</span>
              <span className="text-[10px] font-normal opacity-80">
                {b === '1-bit' ? '2 Colors' : b === '2-bit' ? '4 Colors (CGA)' : b === '4-bit' ? '16 Colors (EGA)' : '256 Colors (VGA)'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Screen Mode & Palette Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Screen Mode */}
        <div>
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            QBasic Screen Mode
          </label>
          <div className="relative">
            <select
              value={selectedScreenMode.id}
              onChange={(e) => {
                const found = SCREEN_MODES.find((m) => m.id === e.target.value);
                if (found) onSelectScreenMode(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs font-mono appearance-none focus:outline-none focus:border-blue-500 pr-8"
            >
              {availableModes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Segment: <code className="text-blue-400">{selectedScreenMode.segmentHex}</code> •{' '}
            Payload: <code className="text-emerald-400">{selectedScreenMode.payloadBytes.toLocaleString()} B</code>
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Color Palette Preset
          </label>
          <div className="relative">
            <select
              value={selectedPalettePreset.id}
              onChange={(e) => {
                const found = PALETTE_PRESETS.find((p) => p.id === e.target.value);
                if (found) onSelectPalettePreset(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs font-mono appearance-none focus:outline-none focus:border-blue-500 pr-8"
            >
              {availablePalettes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate" title={selectedPalettePreset.description}>
            {selectedPalettePreset.description}
          </div>
        </div>
      </div>

      {/* 4. Dithering Engine Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
            <span>Dithering Algorithm</span>
            <span className="text-amber-400 font-normal">{ditherType.replace('_', ' ')}</span>
          </label>
          <div className="relative">
            <select
              value={ditherType}
              onChange={(e) => onChangeDitherType(e.target.value as DitherType)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs font-mono appearance-none focus:outline-none focus:border-blue-500 pr-8"
            >
              <option value="floyd_steinberg">Floyd-Steinberg (Classic smooth error diffusion)</option>
              <option value="atkinson">Atkinson (Vintage Macintosh / high contrast)</option>
              <option value="bayer_4x4">Bayer 4x4 (Classic ordered crosshatch)</option>
              <option value="bayer_8x8">Bayer 8x8 (Fine ordered matrix)</option>
              <option value="bayer_2x2">Bayer 2x2 (Coarse 2x2 pattern)</option>
              <option value="sierra">Sierra (High precision 3-line)</option>
              <option value="stucki">Stucki (Smooth portrait diffusion)</option>
              <option value="burkes">Burkes (Clean horizontal diffusion)</option>
              <option value="none">None (Threshold / Nearest Color)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Dither Diffusion Strength */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Diffusion Strength
            </label>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {adjustments.ditherStrength}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={adjustments.ditherStrength}
            onChange={(e) =>
              onChangeAdjustments({ ...adjustments, ditherStrength: Number(e.target.value) })
            }
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
            <span>0% (Posterize)</span>
            <span>100% (Standard)</span>
            <span>150% (Intense)</span>
          </div>
        </div>
      </div>

      {/* 5. Pre-Processing Image Adjustments (Collapsible Controls) */}
      <div className="border border-slate-800 bg-slate-950/60 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-mono font-semibold text-slate-300">
              Pre-Processing Adjustments
            </span>
          </div>
          <button
            onClick={handleResetAdjustments}
            className="text-[11px] font-mono text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* Brightness */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Brightness</span>
              <span className="text-slate-200">{adjustments.brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.brightness}
              onChange={(e) =>
                onChangeAdjustments({ ...adjustments, brightness: Number(e.target.value) })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Contrast</span>
              <span className="text-slate-200">{adjustments.contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.contrast}
              onChange={(e) =>
                onChangeAdjustments({ ...adjustments, contrast: Number(e.target.value) })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Gamma */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Gamma</span>
              <span className="text-slate-200">{adjustments.gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.05"
              value={adjustments.gamma}
              onChange={(e) =>
                onChangeAdjustments({ ...adjustments, gamma: Number(e.target.value) })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Saturation</span>
              <span className="text-slate-200">{adjustments.saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={adjustments.saturation}
              onChange={(e) =>
                onChangeAdjustments({ ...adjustments, saturation: Number(e.target.value) })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Toggles: Invert & Aspect Ratio */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={adjustments.invert}
                onChange={(e) =>
                  onChangeAdjustments({ ...adjustments, invert: e.target.checked })
                }
                className="rounded accent-blue-500"
              />
              <span>Invert Colors</span>
            </label>

            <div className="flex items-center space-x-1.5 text-slate-400">
              <span>Scaling:</span>
              <button
                onClick={() => onChangeAdjustments({ ...adjustments, aspectMode: 'fit' })}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  adjustments.aspectMode === 'fit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Fit
              </button>
              <button
                onClick={() => onChangeAdjustments({ ...adjustments, aspectMode: 'fill' })}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  adjustments.aspectMode === 'fill'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Crop
              </button>
              <button
                onClick={() => onChangeAdjustments({ ...adjustments, aspectMode: 'stretch' })}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  adjustments.aspectMode === 'stretch'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Stretch
              </button>
            </div>
          </div>

          {/* Filename input */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">DOS Name:</span>
            <input
              type="text"
              maxLength={8}
              value={baseFilename}
              onChange={(e) => onChangeBaseFilename(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
            />
            <span className="text-slate-500">.BSV</span>
          </div>
        </div>
      </div>
    </div>
  );
};
