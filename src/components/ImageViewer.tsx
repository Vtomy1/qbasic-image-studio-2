import React, { useRef, useEffect, useState } from 'react';
import { RgbColor, ScreenModeDef } from '../types/qbasic';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Tv,
  Eye,
  Grid,
  Sparkles,
  Info,
} from 'lucide-react';

interface ImageViewerProps {
  sourceCanvas: HTMLCanvasElement | null;
  outputImageData: ImageData | null;
  palette: RgbColor[];
  indexedPixels: Uint8Array | null;
  screenMode: ScreenModeDef;
  correctAspectRatio: boolean;
  onToggleAspectRatio: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  sourceCanvas,
  outputImageData,
  palette,
  indexedPixels,
  screenMode,
  correctAspectRatio,
  onToggleAspectRatio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'retro' | 'original' | 'split'>('retro');
  const [splitPos, setSplitPos] = useState<number>(50); // percentage
  const [crtEffect, setCrtEffect] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [hoveredColor, setHoveredColor] = useState<RgbColor | null>(null);

  // Render processed image onto canvas
  useEffect(() => {
    if (!canvasRef.current || !outputImageData) return;
    const canvas = canvasRef.current;
    canvas.width = outputImageData.width;
    canvas.height = outputImageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(outputImageData, 0, 0);
  }, [outputImageData]);

  // Compute color frequency counts
  const colorCounts = React.useMemo(() => {
    if (!indexedPixels) return new Map<number, number>();
    const map = new Map<number, number>();
    for (let i = 0; i < indexedPixels.length; i++) {
      const idx = indexedPixels[i];
      map.set(idx, (map.get(idx) || 0) + 1);
    }
    return map;
  }, [indexedPixels]);

  // Pixel aspect ratio scaling
  // CRT 320x200 was displayed on 4:3 monitor -> 320 / 200 = 1.6 vs 4/3 = 1.333
  // Each pixel has aspect ratio of (4/3) / (320/200) = 0.8333 (width) to 1 (height), or 1:1.2 vertical stretch
  const pixelAspectScaleY =
    correctAspectRatio && (screenMode.height === 200 || screenMode.height === 350)
      ? 1.2
      : 1.0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 font-mono">
          <button
            onClick={() => setViewMode('retro')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === 'retro'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Retro QBasic
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === 'original'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Original
          </button>
        </div>

        {/* Display Toggles */}
        <div className="flex items-center space-x-2">
          {/* CRT Effect Toggle */}
          <button
            onClick={() => setCrtEffect(!crtEffect)}
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors font-mono ${
              crtEffect
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle CRT scanlines & phosphor bloom"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>CRT Scanlines</span>
          </button>

          {/* 4:3 Aspect Ratio Correction */}
          <button
            onClick={onToggleAspectRatio}
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors font-mono ${
              correctAspectRatio
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 4:3 CRT non-square pixel correction (320x200 was stretched vertically 1.2x on real CRT monitors!)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>4:3 CRT Ratio</span>
          </button>

          {/* Zoom In / Out */}
          <div className="flex items-center bg-slate-800 rounded border border-slate-700 p-0.5 font-mono">
            <button
              onClick={() => setZoom(Math.max(1, zoom - 1))}
              disabled={zoom <= 1}
              className="px-1.5 py-0.5 text-slate-300 hover:text-white disabled:opacity-40"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] text-slate-200">{zoom}x</span>
            <button
              onClick={() => setZoom(Math.min(5, zoom + 1))}
              disabled={zoom >= 5}
              className="px-1.5 py-0.5 text-slate-300 hover:text-white disabled:opacity-40"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 min-h-[380px] max-h-[560px] bg-[#0c0d12] flex items-center justify-center p-4 overflow-auto select-none">
        {/* Retro CRT Monitor Bezel styling if CRT effect enabled */}
        <div
          className={`relative transition-all duration-200 ${
            crtEffect
              ? 'p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-2xl shadow-2xl border-4 border-slate-700/60'
              : ''
          }`}
        >
          {/* CRT Screen Glow Glass container */}
          <div
            className={`relative overflow-hidden bg-black flex items-center justify-center ${
              crtEffect ? 'rounded-lg ring-1 ring-white/10 shadow-inner' : ''
            }`}
            style={{
              transform: `scaleY(${pixelAspectScaleY})`,
              transformOrigin: 'center center',
            }}
          >
            {/* The Processed Retro Canvas */}
            <canvas
              ref={canvasRef}
              className={`transition-opacity duration-150 ${
                viewMode === 'original' ? 'hidden' : 'block'
              }`}
              style={{
                width: outputImageData ? outputImageData.width * zoom : screenMode.width * zoom,
                height: outputImageData ? outputImageData.height * zoom : screenMode.height * zoom,
                imageRendering: 'pixelated',
              }}
            />

            {/* Original Image comparison (if split or original mode) */}
            {sourceCanvas && (viewMode === 'original' || viewMode === 'split') && (
              <div
                className={`absolute inset-0 overflow-hidden pointer-events-none ${
                  viewMode === 'original' ? 'relative w-full h-full' : ''
                }`}
                style={
                  viewMode === 'split'
                    ? { width: `${splitPos}%`, borderRight: '2px solid #00f0ff' }
                    : {}
                }
              >
                <img
                  src={sourceCanvas.toDataURL()}
                  alt="Original"
                  className="w-full h-full object-fill pointer-events-none"
                  style={{
                    width: outputImageData ? outputImageData.width * zoom : screenMode.width * zoom,
                    height: outputImageData ? outputImageData.height * zoom : screenMode.height * zoom,
                    imageRendering: 'pixelated',
                  }}
                />
              </div>
            )}

            {/* Split Slider Handle */}
            {viewMode === 'split' && (
              <input
                type="range"
                min="0"
                max="100"
                value={splitPos}
                onChange={(e) => setSplitPos(Number(e.target.value))}
                className="absolute inset-x-0 bottom-2 w-3/4 mx-auto z-20 cursor-ew-resize opacity-60 hover:opacity-100 transition-opacity"
              />
            )}

            {/* CRT Scanline Overlay */}
            {crtEffect && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 2px)',
                  backgroundSize: '100% 2px',
                  mixBlendMode: 'multiply',
                }}
              />
            )}

            {/* CRT Vignette & Curvature Reflection */}
            {crtEffect && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(0,0,0,0) 65%, rgba(0,0,0,0.6) 100%)',
                  boxShadow: 'inset 0 0 16px rgba(0,0,0,0.9)',
                }}
              />
            )}
          </div>

          {/* CRT Power Indicator LED */}
          {crtEffect && (
            <div className="flex items-center justify-between pt-2 px-2 text-[10px] font-mono text-slate-500">
              <span className="text-slate-400 font-bold tracking-wider">IBM 5153 / 8513 COLOR DISPLAY</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80"></span>
                <span className="text-emerald-400/90 text-[9px]">VGA ACTIVE</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Palette Color Swatches Bar */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">Active Palette:</span>
            <span className="text-white font-bold">{palette.length} Colors</span>
            <span className="text-slate-500">
              ({screenMode.bitDepth} • {screenMode.name})
            </span>
          </div>
          {hoveredColor && (
            <div className="text-xs font-mono text-amber-300 flex items-center space-x-2">
              <span>{hoveredColor.name || `RGB(${hoveredColor.r}, ${hoveredColor.g}, ${hoveredColor.b})`}</span>
              <span className="text-slate-400">
                • {colorCounts.get(hoveredColor.qbasicIndex ?? -1)?.toLocaleString() || 0} px
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Color Grid */}
        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-900/60 rounded-lg border border-slate-800/80">
          {palette.map((c, idx) => {
            const count = colorCounts.get(c.qbasicIndex ?? idx) || 0;
            const isUsed = count > 0;
            const hex = `#${c.r.toString(16).padStart(2, '0')}${c.g
              .toString(16)
              .padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredColor(c)}
                onMouseLeave={() => setHoveredColor(null)}
                className={`relative group w-5 h-5 rounded cursor-pointer transition-transform hover:scale-125 hover:z-20 border ${
                  isUsed ? 'border-slate-600' : 'border-slate-800 opacity-40'
                }`}
                style={{ backgroundColor: hex }}
                title={`${c.name || `Color ${idx}`}: RGB(${c.r},${c.g},${c.b}) - Used: ${count.toLocaleString()} px`}
              >
                {!isUsed && (
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] text-red-400/60 font-mono">
                    ×
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
