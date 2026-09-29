import React, { useState } from 'react';
import { BsaveHeaderInfo, ScreenModeDef } from '../types/qbasic';
import { Binary, Copy, Check, FileCheck, Layers } from 'lucide-react';

interface HexInspectorProps {
  header: BsaveHeaderInfo;
  fileBytes: Uint8Array;
  screenMode: ScreenModeDef;
}

export const HexInspector: React.FC<HexInspectorProps> = ({ header, fileBytes, screenMode }) => {
  const [viewOffset, setViewOffset] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const bytesPerRow = 16;
  const rowsToShow = 16;
  const totalDisplayBytes = bytesPerRow * rowsToShow; // 256 bytes

  const currentSlice = fileBytes.subarray(
    viewOffset,
    Math.min(fileBytes.length, viewOffset + totalDisplayBytes)
  );

  const handleCopyHex = () => {
    let hexString = '';
    for (let i = 0; i < Math.min(fileBytes.length, 512); i++) {
      hexString += fileBytes[i].toString(16).padStart(2, '0').toUpperCase() + ' ';
      if ((i + 1) % 16 === 0) hexString += '\n';
    }
    navigator.clipboard.writeText(hexString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Binary className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            BSAVE 7-Byte Header &amp; Binary Hex Inspector
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Total File:</span>
          <span className="text-emerald-400 font-bold">{fileBytes.length.toLocaleString()} bytes</span>
          <button
            onClick={handleCopyHex}
            className="ml-2 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded flex items-center gap-1 transition-colors"
            title="Copy first 512 bytes as hex"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Hex'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 7-Byte Header Visual Cards */}
        <div>
          <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>HEADER STRUCTURE (Bytes 0 to 6):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono text-xs">
            {/* Byte 0: Magic */}
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-2.5">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Byte 0: Magic</div>
              <div className="text-base font-bold text-amber-300 mt-1">
                0x{fileBytes[0]?.toString(16).toUpperCase().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">253 (&amp;HFD)</div>
              <div className="text-[10px] text-amber-400/80 mt-1">BSAVE ID</div>
            </div>

            {/* Byte 1: Seg Lo */}
            <div className="bg-blue-950/40 border border-blue-500/40 rounded-lg p-2.5">
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Byte 1: Seg Low</div>
              <div className="text-base font-bold text-blue-300 mt-1">
                0x{fileBytes[1]?.toString(16).toUpperCase().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{fileBytes[1]} dec</div>
              <div className="text-[10px] text-blue-400/80 mt-1">Segment Low</div>
            </div>

            {/* Byte 2: Seg Hi */}
            <div className="bg-blue-950/40 border border-blue-500/40 rounded-lg p-2.5">
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Byte 2: Seg High</div>
              <div className="text-base font-bold text-blue-300 mt-1">
                0x{fileBytes[2]?.toString(16).toUpperCase().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{header.segmentHex}</div>
              <div className="text-[10px] text-blue-400/80 mt-1">Segment High</div>
            </div>

            {/* Byte 3: Off Lo */}
            <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-lg p-2.5">
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Byte 3: Off Low</div>
              <div className="text-base font-bold text-indigo-300 mt-1">
                0x{fileBytes[3]?.toString(16).toUpperCase().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{fileBytes[3]} dec</div>
              <div className="text-[10px] text-indigo-400/80 mt-1">Offset Low</div>
            </div>

            {/* Byte 4: Off Hi */}
            <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-lg p-2.5">
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Byte 4: Off High</div>
              <div className="text-base font-bold text-indigo-300 mt-1">
                0x{fileBytes[4]?.toString(16).toUpperCase().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{header.offsetHex}</div>
              <div className="text-[10px] text-indigo-400/80 mt-1">Offset High</div>
            </div>

            {/* Byte 5: Len Lo */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-2.5">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Byte 5: Len Low</div>
              <div className="text-base font-bold text-emerald-300 mt-1">
                0x{fileBytes[5]?.toString(16).toUpperCase().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{fileBytes[5]} dec</div>
              <div className="text-[10px] text-emerald-400/80 mt-1">Payload Low</div>
            </div>

            {/* Byte 6: Len Hi */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-2.5">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Byte 6: Len High</div>
              <div className="text-base font-bold text-emerald-300 mt-1">
                0x{fileBytes[6]?.toString(16).toUpperCase().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{header.lengthHex}</div>
              <div className="text-[10px] text-emerald-400/80 mt-1">{header.payloadLength.toLocaleString()} B</div>
            </div>
          </div>
        </div>

        {/* Quick Jump Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Jump to:</span>
            <button
              onClick={() => setViewOffset(0)}
              className={`px-2 py-1 rounded transition-colors ${
                viewOffset === 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Header (Offset 0x0000)
            </button>
            <button
              onClick={() => setViewOffset(Math.min(fileBytes.length - 256, 8192))}
              className={`px-2 py-1 rounded transition-colors ${
                viewOffset === 8192 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Mid Payload (0x2000)
            </button>
            <button
              onClick={() => setViewOffset(Math.max(0, fileBytes.length - totalDisplayBytes))}
              className={`px-2 py-1 rounded transition-colors ${
                viewOffset >= fileBytes.length - totalDisplayBytes ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              End of File
            </button>
          </div>
          <div className="text-slate-400">
            Showing bytes <span className="text-slate-200">{viewOffset}</span> to{' '}
            <span className="text-slate-200">{Math.min(fileBytes.length, viewOffset + totalDisplayBytes)}</span>
          </div>
        </div>

        {/* Hex Grid Viewer */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[12px] overflow-x-auto">
          {/* Header Row */}
          <div className="flex text-slate-500 border-b border-slate-800 pb-1 mb-1">
            <div className="w-20 shrink-0 text-slate-400">OFFSET</div>
            <div className="flex-1 grid grid-cols-16 gap-1 text-center min-w-[340px]">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="text-slate-500">
                  {i.toString(16).toUpperCase()}
                </span>
              ))}
            </div>
            <div className="w-36 shrink-0 pl-3 text-slate-400 hidden sm:block">ASCII</div>
          </div>

          {/* Hex Rows */}
          {Array.from({ length: Math.ceil(currentSlice.length / bytesPerRow) }).map((_, rowIndex) => {
            const rowStart = viewOffset + rowIndex * bytesPerRow;
            const rowBytes = fileBytes.subarray(rowStart, Math.min(fileBytes.length, rowStart + bytesPerRow));

            return (
              <div key={rowIndex} className="flex hover:bg-slate-900/60 py-0.5 leading-relaxed">
                {/* Offset */}
                <div className="w-20 shrink-0 text-slate-500 font-semibold select-none">
                  {rowStart.toString(16).padStart(6, '0').toUpperCase()}
                </div>

                {/* Hex Bytes */}
                <div className="flex-1 grid grid-cols-16 gap-1 text-center min-w-[340px]">
                  {Array.from({ length: 16 }).map((_, byteIndex) => {
                    const absOffset = rowStart + byteIndex;
                    const byteVal = fileBytes[absOffset];

                    if (absOffset >= fileBytes.length) {
                      return <span key={byteIndex} className="text-slate-800">..</span>;
                    }

                    // Special coloring for 7-byte header
                    let colorClass = 'text-slate-300';
                    if (absOffset === 0) {
                      colorClass = 'text-amber-400 font-bold bg-amber-500/20 rounded'; // Magic
                    } else if (absOffset === 1 || absOffset === 2) {
                      colorClass = 'text-blue-400 font-bold bg-blue-500/20 rounded'; // Segment
                    } else if (absOffset === 3 || absOffset === 4) {
                      colorClass = 'text-indigo-400 font-bold bg-indigo-500/20 rounded'; // Offset
                    } else if (absOffset === 5 || absOffset === 6) {
                      colorClass = 'text-emerald-400 font-bold bg-emerald-500/20 rounded'; // Length
                    } else if (byteVal === 0) {
                      colorClass = 'text-slate-600';
                    }

                    return (
                      <span key={byteIndex} className={colorClass} title={`Offset ${absOffset}: 0x${byteVal.toString(16).padStart(2, '0')}`}>
                        {byteVal.toString(16).padStart(2, '0').toUpperCase()}
                      </span>
                    );
                  })}
                </div>

                {/* ASCII View */}
                <div className="w-36 shrink-0 pl-3 text-slate-400 select-none hidden sm:block">
                  {Array.from(rowBytes).map((b, i) => {
                    const char = b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
                    const absOffset = rowStart + i;
                    const isHeader = absOffset < 7;
                    return (
                      <span key={i} className={isHeader ? 'text-amber-400 font-bold' : ''}>
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
            <span>0xFD Magic (Byte 0)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
            <span>Segment (Bytes 1-2)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span>
            <span>Offset (Bytes 3-4)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
            <span>Payload Length (Bytes 5-6)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-400 inline-block"></span>
            <span>Raw Video Payload (Bytes 7+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
