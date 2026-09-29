import { BsaveHeaderInfo, PalettePreset, RgbColor, ScreenModeDef } from '../types/qbasic';

export function generateQBasicLoaderCode(
  screenMode: ScreenModeDef,
  filename: string,
  palette: RgbColor[],
  isCustomPalette: boolean
): string {
  const modeId = screenMode.id;
  const bsvFile = filename.toUpperCase();

  let code = `' =====================================================================
' QBASIC / QUICKBASIC BLOAD IMAGE LOADER
' Generated for: ${screenMode.name}
' Target File: ${bsvFile}
' Segment: ${screenMode.segmentHex}, Offset: ${screenMode.offsetHex}, Length: ${screenMode.payloadBytes} bytes
' =====================================================================

DEFINT A-Z
CLS

`;

  if (modeId === 'screen13') {
    code += `' 1. Switch to VGA 320x200 256-color graphics mode
SCREEN 13

`;
    if (isCustomPalette) {
      code += `' 2. Set Custom VGA Palette (OUT &H3C8 is the DAC Write Address Register)
' Note: VGA DAC registers accept 6-bit values (0 to 63)
OUT &H3C8, 0 ' Start at color index 0
FOR c = 0 TO 255
    READ r, g, b
    OUT &H3C9, r
    OUT &H3C9, g
    OUT &H3C9, b
NEXT c

`;
    }

    code += `' 3. Point memory segment to VGA Video RAM (&HA000)
DEF SEG = &HA000

' 4. Check if file exists and BLOAD directly to video memory
PRINT "Loading ${bsvFile}...";
BLOAD "${bsvFile}", 0

' 5. Reset segment back to default DGROUP
DEF SEG

' 6. Wait for user keypress then restore text mode
LOCATE 1, 1: PRINT "Press any key to exit...";
DO: LOOP WHILE INKEY$ = ""
SCREEN 0: WIDTH 80: CLS
PRINT "Done! Thank you for using QBasic BSAVE Converter."
END

`;

    if (isCustomPalette) {
      code += `' --- CUSTOM PALETTE RGB DATA (0-63 each) ---
`;
      for (let i = 0; i < 256; i += 8) {
        const row = [];
        for (let j = 0; j < 8 && i + j < 256; j++) {
          const c = palette[i + j] || { r: 0, g: 0, b: 0 };
          const r = Math.floor((c.r / 255) * 63);
          const g = Math.floor((c.g / 255) * 63);
          const b = Math.floor((c.b / 255) * 63);
          row.push(`${r},${g},${b}`);
        }
        code += `DATA ${row.join(', ')}\n`;
      }
    }

    return code;
  }

  if (modeId === 'screen1') {
    return `' =====================================================================
' QBASIC / QUICKBASIC CGA SCREEN 1 BLOAD LOADER
' Target: CGA 320x200 4 Colors (Interlaced video memory at &HB800)
' =====================================================================

DEFINT A-Z
CLS

' Set CGA 320x200 4-color mode
' Color 0, 1 = Black background, Palette 1 (Cyan/Magenta/White)
SCREEN 1
COLOR 0, 1

' Point segment to CGA Video RAM (&HB800)
' CGA interlaced memory contains Bank 0 (even lines) at offset 0
' and Bank 1 (odd lines) at offset &H2000 (8192 bytes)
DEF SEG = &HB800

' BLOAD entire 16,192 byte CGA image directly
BLOAD "${bsvFile}", 0

' Restore default memory segment
DEF SEG

' Wait for keypress
DO: LOOP WHILE INKEY$ = ""
SCREEN 0: WIDTH 80: CLS
END
`;
  }

  if (modeId === 'screen11') {
    return `' =====================================================================
' QBASIC / QUICKBASIC SCREEN 11 BLOAD LOADER
' Target: VGA 640x480 2 Colors (Monochrome at &HA000, 38,400 bytes)
' =====================================================================

DEFINT A-Z
CLS

' 640x480 2-color mode
SCREEN 11

' Point segment to VGA Video RAM (&HA000)
DEF SEG = &HA000

' BLOAD 38,400 bytes of 1-bit monochrome pixel data
BLOAD "${bsvFile}", 0

' Restore segment
DEF SEG

DO: LOOP WHILE INKEY$ = ""
SCREEN 0: WIDTH 80: CLS
END
`;
  }

  if (modeId === 'screen2') {
    return `' =====================================================================
' QBASIC / QUICKBASIC SCREEN 2 BLOAD LOADER
' Target: CGA 640x200 Monochrome Interlaced (&HB800, 16,192 bytes)
' =====================================================================

DEFINT A-Z
CLS

' CGA 640x200 2-color mode
SCREEN 2

' CGA video buffer segment
DEF SEG = &HB800

' BLOAD interlaced CGA buffer
BLOAD "${bsvFile}", 0

' Restore segment
DEF SEG

DO: LOOP WHILE INKEY$ = ""
SCREEN 0: WIDTH 80: CLS
END
`;
  }

  if (modeId === 'screen7') {
    return `' =====================================================================
' QBASIC / QUICKBASIC SCREEN 7 EGA/VGA 16-COLOR PLANAR BLOAD LOADER
' Target: 320x200 16 Colors (4 Bitplanes of 8,000 bytes each)
' =====================================================================

DEFINT A-Z
CLS
SCREEN 7

' SCREEN 7 uses 4 hardware bitplanes:
' Plane 0 = Blue, Plane 1 = Green, Plane 2 = Red, Plane 3 = Intensity
' To load planar memory, we read 8000 bytes per plane while setting
' the VGA Map Mask Register (Port &H3C4 / &H3C5)
OPEN "${bsvFile}" FOR BINARY AS #1

' Skip 7-byte BSAVE header
SEEK #1, 8

DEF SEG = &HA000
buffer$ = SPACE$(8000)

FOR plane = 0 TO 3
    ' Select target plane in VGA hardware
    OUT &H3C4, 2
    OUT &H3C5, 2 ^ plane
    
    ' Read plane bytes and write directly to video memory
    GET #1, , buffer$
    FOR i = 0 TO 7999
        POKE i, ASC(MID$(buffer$, i + 1, 1))
    NEXT i
NEXT plane

CLOSE #1

' Restore VGA Map Mask to enable all 4 planes
OUT &H3C4, 2: OUT &H3C5, 15
DEF SEG

DO: LOOP WHILE INKEY$ = ""
SCREEN 0: WIDTH 80: CLS
END
`;
  }

  if (modeId === 'screen12') {
    return `' =====================================================================
' QBASIC / QUICKBASIC SCREEN 12 VGA 16-COLOR PLANAR BLOAD LOADER
' Target: 640x480 16 Colors (4 Bitplanes of 38,400 bytes each)
' =====================================================================

DEFINT A-Z
CLS
SCREEN 12

OPEN "${bsvFile}" FOR BINARY AS #1
SEEK #1, 8 ' Skip 7-byte BSAVE header

DEF SEG = &HA000
buffer$ = SPACE$(1600) ' Read in 1600-byte chunks

FOR plane = 0 TO 3
    OUT &H3C4, 2
    OUT &H3C5, 2 ^ plane
    
    FOR chunk = 0 TO 23 ' 24 chunks * 1600 = 38400 bytes
        GET #1, , buffer$
        offset = chunk * 1600
        FOR i = 0 TO 1599
            POKE offset + i, ASC(MID$(buffer$, i + 1, 1))
        NEXT i
    NEXT chunk
NEXT plane

CLOSE #1
OUT &H3C4, 2: OUT &H3C5, 15
DEF SEG

DO: LOOP WHILE INKEY$ = ""
SCREEN 0: WIDTH 80: CLS
END
`;
  }

  // qb_array: QBasic Array format
  return `' =====================================================================
' QBASIC / QUICKBASIC PUT/GET ARRAY BLOAD LOADER
' Target: BLOAD into Integer Array and render with PUT
' =====================================================================

DEFINT A-Z
CLS
SCREEN 13

' Array size: 4 bytes header + 64,000 bytes = 64,004 bytes
' In QBasic, each INTEGER (%) is 2 bytes. 64004 / 2 = 32002 elements.
DIM img%(32002)

' Point segment to variable array segment
DEF SEG = VARSEG(img%(0))

' BLOAD into the array starting at offset VARPTR
BLOAD "${bsvFile}", VARPTR(img%(0))

' Restore segment
DEF SEG

' Render sprite/image to screen using PUT
PUT (0, 0), img%, PSET

DO: LOOP WHILE INKEY$ = ""
SCREEN 0: WIDTH 80: CLS
END
`;
}

export function generateQBasicSaverCode(
  screenMode: ScreenModeDef,
  filename: string
): string {
  const bsvFile = filename.toUpperCase();
  const seg = screenMode.segmentHex;
  const off = screenMode.offsetHex;
  const len = screenMode.payloadBytes;

  if (screenMode.id === 'qb_array') {
    return `' =====================================================================
' QBASIC BSAVE CODE: HOW TO CAPTURE & SAVE AN ARRAY IMAGE
' =====================================================================

DEFINT A-Z
CLS
SCREEN 13

' 1. Allocate integer array for image
DIM img%(32002)

' 2. Draw or render graphics onto screen
FOR y = 0 TO 199
    FOR x = 0 TO 319
        PSET (x, y), (x + y) MOD 256
    NEXT x
NEXT y

' 3. Capture screen into array using GET
GET (0, 0)-(319, 199), img%

' 4. Point DEF SEG to array segment and BSAVE
DEF SEG = VARSEG(img%(0))
BSAVE "${bsvFile}", VARPTR(img%(0)), 64004
DEF SEG

PRINT "Image successfully saved to ${bsvFile}!"
END
`;
  }

  return `' =====================================================================
' QBASIC BSAVE CODE: HOW TO CAPTURE & SAVE DIRECT VIDEO MEMORY
' Target Screen Mode: ${screenMode.name}
' =====================================================================

DEFINT A-Z
CLS

' 1. Initialize screen mode
${screenMode.id === 'screen13' ? 'SCREEN 13' : screenMode.id === 'screen1' ? 'SCREEN 1' : screenMode.id === 'screen11' ? 'SCREEN 11' : screenMode.id === 'screen2' ? 'SCREEN 2' : 'SCREEN 7'}

' 2. (Optional) Draw sample graphic pattern
FOR i = 0 TO 100
    CIRCLE (160, 100), i, (i MOD 15) + 1
NEXT i

' 3. Set memory segment to video VRAM (${seg})
DEF SEG = ${seg}

' 4. Execute BSAVE command:
' Syntax: BSAVE filename$, offset, length
' Segment: ${seg}
' Offset:  ${off}
' Length:  ${len} bytes
BSAVE "${bsvFile}", ${off}, ${len}

' 5. Reset segment to default
DEF SEG

LOCATE 1, 1: PRINT "Successfully BSAVEd ${bsvFile} (${len} bytes)!"
DO: LOOP WHILE INKEY$ = ""
SCREEN 0: WIDTH 80: CLS
END
`;
}

/**
 * Generates pure standalone QBasic DATA loader
 * Reconstructs the image pixel by pixel or writes the BSV file from DATA without needing external files!
 */
export function generateQBasicDataCode(
  screenMode: ScreenModeDef,
  filename: string,
  indexedPixels: Uint8Array
): string {
  const { width, height } = screenMode;
  let code = `' =====================================================================
' STANDALONE QBASIC INLINE RUN-LENGTH DATA LOADER
' Runs directly in QBasic 1.1 / QuickBASIC 4.5 / QB64 with NO external files!
' =====================================================================

DEFINT A-Z
CLS
`;

  if (screenMode.id === 'screen13') {
    code += `SCREEN 13\nDEF SEG = &HA000\n\n`;
  } else if (screenMode.id === 'screen1') {
    code += `SCREEN 1: COLOR 0, 1\nDEF SEG = &HB800\n\n`;
  } else if (screenMode.id === 'screen11') {
    code += `SCREEN 11\nDEF SEG = &HA000\n\n`;
  } else {
    code += `SCREEN 13\nDEF SEG = &HA000\n\n`;
  }

  code += `' RLE Decoder (Count, Value pairs)
x = 0: y = 0
DO
    READ cnt, val%
    IF cnt = -1 THEN EXIT DO
    FOR k = 1 TO cnt
        PSET (x, y), val%
        x = x + 1
        IF x >= ${width} THEN
            x = 0
            y = y + 1
            IF y >= ${height} THEN EXIT DO
        END IF
    NEXT k
LOOP
DEF SEG

LOCATE 1, 1: PRINT "Done! Press any key.";
DO: LOOP WHILE INKEY$ = ""
SCREEN 0: WIDTH 80: CLS
END

' --- RUN-LENGTH ENCODED PIXEL DATA (count, color) ---
`;

  // Encode pixels with RLE
  const rle: [number, number][] = [];
  let currentVal = indexedPixels[0];
  let currentCount = 1;

  for (let i = 1; i < indexedPixels.length; i++) {
    if (indexedPixels[i] === currentVal && currentCount < 255) {
      currentCount++;
    } else {
      rle.push([currentCount, currentVal]);
      currentVal = indexedPixels[i];
      currentCount = 1;
    }
  }
  rle.push([currentCount, currentVal]);

  // Format into DATA lines
  const maxPairsPerLine = 12;
  // Limit output lines to keep file practical (first 500 lines or sample)
  const previewRle = rle.slice(0, 400);

  for (let i = 0; i < previewRle.length; i += maxPairsPerLine) {
    const chunk = previewRle.slice(i, i + maxPairsPerLine);
    code += `DATA ${chunk.map(([c, v]) => `${c},${v}`).join(', ')}\n`;
  }

  if (rle.length > 400) {
    code += `' ... [Truncated for inline preview: ${rle.length - 400} more pairs]\n`;
  }
  code += `DATA -1, 0 ' End of Data Marker\n`;

  return code;
}
