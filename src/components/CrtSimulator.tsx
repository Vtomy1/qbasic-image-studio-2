import React, { useEffect, useRef, useState } from 'react';
import { ScreenModeDef } from '../types/qbasic';
import { Play, RotateCcw, Volume2, VolumeX, X, Maximize, Tv } from 'lucide-react';

interface CrtSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  outputImageData: ImageData | null;
  screenMode: ScreenModeDef;
  filename: string;
}

export const CrtSimulator: React.FC<CrtSimulatorProps> = ({
  isOpen,
  onClose,
  outputImageData,
  screenMode,
  filename,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [loadSpeed, setLoadSpeed] = useState<'instant' | 'scanline' | 'floppy'>('scanline');
  const [statusText, setStatusText] = useState<string>('Press RUN (F5) to simulate QBasic BLOAD');
  const animFrameRef = useRef<number | null>(null);

  // Synthesize authentic PC Speaker Beep using Web Audio API
  const playPcSpeakerBeep = (freq = 880, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square'; // Classic 8-bit PC speaker square wave!
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked by browser policy
    }
  };

  // Run simulation
  const startSimulation = () => {
    if (!canvasRef.current || !outputImageData) return;
    setRunning(true);
    playPcSpeakerBeep(600, 0.05);

    const canvas = canvasRef.current;
    canvas.width = outputImageData.width;
    canvas.height = outputImageData.height;
    const ctx = canvas.getContext('2d')!;

    // Black screen initially
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setStatusText(`DEF SEG = ${screenMode.segmentHex}: BLOAD "${filename}", 0 ...`);

    if (loadSpeed === 'instant') {
      ctx.putImageData(outputImageData, 0, 0);
      playPcSpeakerBeep(1200, 0.1);
      setStatusText(`Image loaded successfully in ${screenMode.name}! Press any key.`);
      setRunning(false);
      return;
    }

    // Line-by-line or Floppy loading animation
    let currentY = 0;
    const totalLines = outputImageData.height;
    const linesPerFrame = loadSpeed === 'floppy' ? 2 : 6;

    const renderLoop = () => {
      if (currentY >= totalLines) {
        ctx.putImageData(outputImageData, 0, 0);
        playPcSpeakerBeep(1000, 0.1);
        setStatusText(`Done! 100% of ${screenMode.payloadBytes.toLocaleString()} bytes loaded. Press any key.`);
        setRunning(false);
        return;
      }

      // Draw slice
      const nextY = Math.min(totalLines, currentY + linesPerFrame);
      ctx.putImageData(outputImageData, 0, 0, 0, 0, outputImageData.width, nextY);

      if (currentY % 24 === 0) {
        playPcSpeakerBeep(350 + (currentY % 4) * 80, 0.015);
      }

      currentY = nextY;
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    if (isOpen) {
      startSimulation();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setRunning(false);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* DOS Window Title Bar */}
        <div className="bg-[#0000AA] px-4 py-2 flex items-center justify-between text-white font-mono text-xs border-b border-blue-400">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded-sm"></span>
            <span className="font-bold tracking-wider">MS-DOS Prompt — QBASIC.EXE /RUN {filename}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-yellow-300 hover:text-white"
              title="Toggle PC Speaker Audio"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-0.5 rounded hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <button
              onClick={startSimulation}
              disabled={running}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-bold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>RUN (F5)</span>
            </button>
            <button
              onClick={startSimulation}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span>Loading Speed:</span>
            <button
              onClick={() => setLoadSpeed('scanline')}
              className={`px-2 py-0.5 rounded ${
                loadSpeed === 'scanline' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Raster Scan
            </button>
            <button
              onClick={() => setLoadSpeed('floppy')}
              className={`px-2 py-0.5 rounded ${
                loadSpeed === 'floppy' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              1.44M Floppy Disk
            </button>
            <button
              onClick={() => setLoadSpeed('instant')}
              className={`px-2 py-0.5 rounded ${
                loadSpeed === 'instant' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Instant VRAM
            </button>
          </div>
        </div>

        {/* CRT Simulated Monitor */}
        <div className="flex-1 bg-black p-6 flex flex-col items-center justify-center overflow-auto relative">
          <div className="relative p-3 bg-gradient-to-b from-slate-800 to-slate-950 rounded-2xl border-4 border-slate-700/80 shadow-2xl">
            {/* CRT Glass */}
            <div className="relative overflow-hidden bg-black rounded-lg ring-1 ring-white/10 shadow-inner">
              <canvas
                ref={canvasRef}
                className="block"
                style={{
                  width: outputImageData ? Math.min(640, outputImageData.width * 2) : 640,
                  height: outputImageData ? Math.min(480, outputImageData.height * 2) : 400,
                  imageRendering: 'pixelated',
                }}
              />

              {/* CRT Scanline Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 2px)',
                  backgroundSize: '100% 2px',
                  mixBlendMode: 'multiply',
                }}
              />

              {/* Glass glare and vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Status Prompt Line */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">&gt;</span>
            <span>{statusText}</span>
          </div>
          <span className="text-slate-500">{screenMode.name}</span>
        </div>
      </div>
    </div>
  );
};
