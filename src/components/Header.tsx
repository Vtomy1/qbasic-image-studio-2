import React from 'react';
import { Terminal, Download, FileCode, Sparkles, Monitor, Info } from 'lucide-react';

interface HeaderProps {
  onOpenSpecsModal: () => void;
  onOpenCrtModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSpecsModal, onOpenCrtModal }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      {/* Top Retro QBasic Blue IDE Bar */}
      <div className="bg-[#0000AA] text-white px-3 py-1 text-xs font-mono flex items-center justify-between border-b border-blue-400/30">
        <div className="flex items-center space-x-3">
          <span className="bg-white/20 text-yellow-300 px-1 font-bold">■</span>
          <span className="font-bold tracking-wider text-yellow-200">MS-DOS QBASIC 1.1 / QUICKBASIC 4.5</span>
          <span className="text-blue-200 hidden sm:inline">— BSAVE Binary Graphic Suite</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-200 text-[11px]">
          <span className="hover:text-yellow-300 cursor-pointer" onClick={onOpenSpecsModal}>
            <span className="underline text-yellow-400">H</span>elp (F1)
          </span>
          <span className="hover:text-yellow-300 cursor-pointer hidden md:inline" onClick={onOpenCrtModal}>
            <span className="underline text-yellow-400">R</span>un (F5)
          </span>
          <span className="text-yellow-300 font-semibold hidden lg:inline">Shift+F5: Restart</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center text-amber-400 font-mono font-black text-lg">
              &gt;_
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                QBasic BSAVE Converter
              </h1>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                1/2/4/8-Bit
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Convert modern images to authentic MS-DOS <code className="text-amber-400 font-mono">BSAVE</code> binary files with dithering &amp; QBasic code
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCrtModal}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Monitor className="w-4 h-4" />
            <span>CRT DOSBox Runner</span>
          </button>

          <button
            onClick={onOpenSpecsModal}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-4 h-4 text-blue-400" />
            <span>BSAVE Header Specs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
