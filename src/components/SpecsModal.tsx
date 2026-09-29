import React from 'react';
import { X, BookOpen, Layers, Cpu, Terminal, CheckCircle2 } from 'lucide-react';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0000AA] px-5 py-3 flex items-center justify-between text-white border-b border-blue-400">
          <div className="flex items-center space-x-2.5 font-mono">
            <BookOpen className="w-5 h-5 text-yellow-300" />
            <h2 className="font-bold text-sm tracking-wide text-yellow-200">
              QBASIC BSAVE &amp; GRAPHICS MEMORY SPECIFICATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 font-mono leading-relaxed">
          {/* Section 1: The 7-Byte Header */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              1. The Standard 7-Byte BSAVE Header
            </h3>
            <p className="text-slate-400">
              In Microsoft GW-BASIC, QuickBASIC 4.5, and MS-DOS QBasic 1.1, the <code className="text-amber-400">BSAVE</code> command creates binary files prefixed with an authentic 7-byte header that tells <code className="text-yellow-400">BLOAD</code> where and how much data to load:
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-slate-900 rounded border border-amber-500/30">
                  <div className="text-amber-400 font-bold">Byte 0: Magic ID</div>
                  <div className="text-white mt-1">0xFD (253 dec)</div>
                  <div className="text-slate-500 mt-1">Signals a valid BSAVE file.</div>
                </div>

                <div className="p-2 bg-slate-900 rounded border border-blue-500/30">
                  <div className="text-blue-400 font-bold">Bytes 1-2: Segment</div>
                  <div className="text-white mt-1">16-bit word (Little Endian)</div>
                  <div className="text-slate-500 mt-1">&HA000 (VGA) or &HB800 (CGA)</div>
                </div>

                <div className="p-2 bg-slate-900 rounded border border-indigo-500/30">
                  <div className="text-indigo-400 font-bold">Bytes 3-4: Offset</div>
                  <div className="text-white mt-1">16-bit word (Little Endian)</div>
                  <div className="text-slate-500 mt-1">Usually &H0000</div>
                </div>

                <div className="p-2 bg-slate-900 rounded border border-emerald-500/30">
                  <div className="text-emerald-400 font-bold">Bytes 5-6: Length</div>
                  <div className="text-white mt-1">16-bit word (Little Endian)</div>
                  <div className="text-slate-500 mt-1">Number of data bytes (excl. header)</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Bit Depths & Screen Modes */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              2. Screen Modes &amp; Video Memory Layouts
            </h3>

            <div className="space-y-2">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="text-blue-400">8-Bit: SCREEN 13 (VGA Mode 13h)</span>
                  <span className="text-emerald-400">320x200 • 256 Colors • 64,000 Bytes</span>
                </div>
                <p className="text-slate-400 mt-1">
                  Linear continuous frame buffer at segment <code className="text-yellow-300">&HA000</code>. Each byte is a direct palette index (0-255). Fast and instantaneous BLOAD!
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="text-cyan-400">2-Bit: SCREEN 1 (IBM CGA 4-Color)</span>
                  <span className="text-emerald-400">320x200 • 4 Colors • 16,192 Bytes</span>
                </div>
                <p className="text-slate-400 mt-1">
                  Interlaced memory at segment <code className="text-yellow-300">&HB800</code>. Packed 4 pixels per byte (2 bits each). Even scanlines (0, 2, ... 198) reside at offset 0 (8,000 bytes). Odd scanlines (1, 3, ... 199) reside at offset &H2000 (8,192).
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="text-amber-400">4-Bit: SCREEN 7 / 12 (EGA/VGA 16-Color Planar)</span>
                  <span className="text-emerald-400">16 Colors • 4 Bitplanes</span>
                </div>
                <p className="text-slate-400 mt-1">
                  4 bitplanes (Blue, Green, Red, Intensity). Each pixel color is formed by 1 bit across each of the 4 planes. Can be loaded using the VGA Map Mask register (<code className="text-yellow-300">OUT &H3C4, 2</code>) or via QBasic <code className="text-yellow-300">PUT / GET</code> array format.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="text-slate-300">1-Bit: SCREEN 11 &amp; SCREEN 2 (Monochrome)</span>
                  <span className="text-emerald-400">2 Colors (B&amp;W, Amber, Green)</span>
                </div>
                <p className="text-slate-400 mt-1">
                  Packed 8 pixels per byte (MSB leftmost). SCREEN 11 provides 640x480 resolution (38,400 bytes at &HA000), while SCREEN 2 provides 640x200 CGA interlaced memory (16,192 bytes at &HB800).
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Essential QBasic Rules */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              3. Crucial QBasic Best Practice: DEF SEG Reset
            </h3>
            <p className="text-slate-400">
              When using <code className="text-yellow-300 font-bold">DEF SEG = &HA000</code> or <code className="text-yellow-300 font-bold">&HB800</code>, you MUST always issue a bare <code className="text-yellow-300 font-bold">DEF SEG</code> afterwards! This restores BASIC's default data segment (<code className="text-slate-300">DGROUP</code>). Failing to do so will cause subsequent string allocations or variables to overwrite video memory or crash the system!
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
