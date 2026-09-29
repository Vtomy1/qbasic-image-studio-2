import React, { useState } from 'react';
import { ScreenModeDef, RgbColor } from '../types/qbasic';
import {
  generateQBasicLoaderCode,
  generateQBasicSaverCode,
  generateQBasicDataCode,
} from '../utils/codeGenerators';
import { Copy, Check, Download, FileCode, Terminal, HelpCircle } from 'lucide-react';

interface CodeViewerProps {
  screenMode: ScreenModeDef;
  filename: string;
  palette: RgbColor[];
  isCustomPalette: boolean;
  indexedPixels: Uint8Array;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  screenMode,
  filename,
  palette,
  isCustomPalette,
  indexedPixels,
}) => {
  const [activeTab, setActiveTab] = useState<'loader' | 'saver' | 'data'>('loader');
  const [copied, setCopied] = useState<boolean>(false);

  const loaderCode = generateQBasicLoaderCode(screenMode, filename, palette, isCustomPalette);
  const saverCode = generateQBasicSaverCode(screenMode, filename);
  const dataCode = generateQBasicDataCode(screenMode, filename, indexedPixels);

  const activeCode =
    activeTab === 'loader' ? loaderCode : activeTab === 'saver' ? saverCode : dataCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBas = () => {
    const basFilename =
      activeTab === 'loader'
        ? 'LOADER.BAS'
        : activeTab === 'saver'
        ? 'SAVER.BAS'
        : 'AUTORUN.BAS';

    const blob = new Blob([activeCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = basFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top Bar with Tab Buttons & Actions */}
      <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('loader')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'loader'
                ? 'bg-[#0000AA] text-yellow-300 shadow-sm border border-blue-400/40'
                : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>BLOAD Loader (.BAS)</span>
          </button>

          <button
            onClick={() => setActiveTab('saver')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'saver'
                ? 'bg-[#0000AA] text-yellow-300 shadow-sm border border-blue-400/40'
                : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>BSAVE Saver Code (.BAS)</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
              activeTab === 'data'
                ? 'bg-[#0000AA] text-yellow-300 shadow-sm border border-blue-400/40'
                : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Standalone DATA Script</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadBas}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .BAS</span>
          </button>
        </div>
      </div>

      {/* Code Display Area in Authentic QBasic IDE colors */}
      <div className="relative">
        <div className="bg-[#000088] text-white p-4 font-mono text-[13px] leading-relaxed overflow-x-auto max-h-[480px] overflow-y-auto selection:bg-yellow-400 selection:text-black">
          <pre className="whitespace-pre">
            {activeCode.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              const isComment = trimmed.startsWith("'");
              const isData = trimmed.startsWith('DATA');
              const isKeyword =
                trimmed.startsWith('SCREEN') ||
                trimmed.startsWith('BLOAD') ||
                trimmed.startsWith('BSAVE') ||
                trimmed.startsWith('DEF SEG') ||
                trimmed.startsWith('OUT') ||
                trimmed.startsWith('POKE');

              let lineClass = 'text-slate-100';
              if (isComment) lineClass = 'text-green-300/90 italic';
              else if (isKeyword) lineClass = 'text-yellow-300 font-bold';
              else if (isData) lineClass = 'text-cyan-200';

              return (
                <div key={idx} className={lineClass}>
                  {line || ' '}
                </div>
              );
            })}
          </pre>
        </div>

        {/* Info Explainer Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-300 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-white">How this works in DOSBox / QBasic:</div>
            <p className="text-slate-400">
              {activeTab === 'loader' && (
                <>
                  Put <code className="text-amber-300 font-mono">{filename}</code> and{' '}
                  <code className="text-amber-300 font-mono">LOADER.BAS</code> in your DOSBox directory.
                  Open QBasic, press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">F5</kbd> to run!
                  The <code className="text-yellow-300 font-mono">DEF SEG = {screenMode.segmentHex}</code> points the CPU data segment to Video RAM, and <code className="text-yellow-300 font-mono">BLOAD</code> transfers the file directly to the display controller without looping.
                </>
              )}
              {activeTab === 'saver' && (
                <>
                  In QBasic, <code className="text-yellow-300 font-mono">BSAVE</code> takes: <code className="text-amber-300 font-mono">BSAVE filename$, offset, length</code>.
                  It writes the 7-byte header (magic 0xFD, segment, offset, length) followed by the raw bytes from memory directly to disk!
                </>
              )}
              {activeTab === 'data' && (
                <>
                  The Standalone DATA Script needs no external files! Simply open QBasic, paste this script, and press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">F5</kbd>.
                  It draws the image pixel by pixel using Run-Length Encoded (RLE) BASIC <code className="text-cyan-300 font-mono">DATA</code> statements.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
