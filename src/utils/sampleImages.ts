export interface SampleImage {
  id: string;
  name: string;
  category: string;
  description: string;
  generate: () => HTMLCanvasElement;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'synthwave',
    name: 'Synthwave Sunset & Grid',
    category: 'Gradient & Horizon',
    description: 'Vibrant neon gradient, sun bands, and perspective wireframe grid. Perfect for testing dithering!',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;

      // Deep purple/black sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 260);
      skyGrad.addColorStop(0, '#0a0017');
      skyGrad.addColorStop(0.5, '#2e0854');
      skyGrad.addColorStop(0.8, '#881177');
      skyGrad.addColorStop(1, '#ff3366');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 640, 260);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 70; i++) {
        const x = (i * 137) % 640;
        const y = (i * 73) % 200;
        const s = (i % 3) + 1;
        ctx.fillRect(x, y, s, s);
      }

      // Neon Sun
      const sunX = 320;
      const sunY = 220;
      const sunR = 90;
      const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
      sunGrad.addColorStop(0, '#ffee33');
      sunGrad.addColorStop(0.5, '#ff5533');
      sunGrad.addColorStop(1, '#ff0088');

      ctx.save();
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Horizontal cuts in sun
      ctx.fillStyle = '#120024';
      for (let bar = 0; bar < 6; bar++) {
        const by = sunY - 10 + bar * 16;
        const bh = 2 + bar * 2.5;
        ctx.fillRect(sunX - sunR - 10, by, sunR * 2 + 20, bh);
      }
      ctx.restore();

      // Mountain silhouettes
      ctx.fillStyle = '#1b0330';
      ctx.beginPath();
      ctx.moveTo(0, 260);
      ctx.lineTo(80, 210);
      ctx.lineTo(160, 240);
      ctx.lineTo(240, 190);
      ctx.lineTo(340, 250);
      ctx.lineTo(440, 180);
      ctx.lineTo(540, 230);
      ctx.lineTo(640, 260);
      ctx.closePath();
      ctx.fill();

      // Ground (Perspective Grid)
      const groundGrad = ctx.createLinearGradient(0, 260, 0, 400);
      groundGrad.addColorStop(0, '#100028');
      groundGrad.addColorStop(1, '#050012');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 260, 640, 140);

      // Grid Lines
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 1.5;

      // Vanishing point lines
      for (let x = -300; x <= 940; x += 50) {
        ctx.beginPath();
        ctx.moveTo(sunX, 260);
        ctx.lineTo(x, 400);
        ctx.stroke();
      }

      // Horizontal perspective lines
      ctx.strokeStyle = '#ff00aa';
      for (let i = 1; i <= 9; i++) {
        const y = 260 + Math.pow(i / 9, 2) * 140;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      return canvas;
    },
  },
  {
    id: 'portrait',
    name: 'Cybernetic Portrait (Photo Shading)',
    category: 'Face & Shadows',
    description: 'Subtle skin tones, contrast, and fine facial features for testing Atkinson & Floyd-Steinberg error diffusion.',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;

      // Background vignette
      const bgGrad = ctx.createRadialGradient(200, 200, 30, 200, 200, 250);
      bgGrad.addColorStop(0, '#506070');
      bgGrad.addColorStop(0.7, '#202830');
      bgGrad.addColorStop(1, '#0a0d10');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 400, 400);

      // Face silhouette
      ctx.fillStyle = '#dca882';
      ctx.beginPath();
      ctx.ellipse(200, 210, 85, 115, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cheeks and neck shading
      const shadowGrad = ctx.createLinearGradient(120, 120, 280, 280);
      shadowGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
      shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = shadowGrad;
      ctx.fill();

      // Hair
      ctx.fillStyle = '#2b1b17';
      ctx.beginPath();
      ctx.arc(200, 170, 95, Math.PI, Math.PI * 2);
      ctx.lineTo(295, 260);
      ctx.lineTo(270, 240);
      ctx.lineTo(200, 130);
      ctx.lineTo(130, 240);
      ctx.lineTo(105, 260);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(165, 200, 18, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(235, 200, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris & pupil
      ctx.fillStyle = '#2277bb';
      ctx.beginPath();
      ctx.arc(165, 200, 8, 0, Math.PI * 2);
      ctx.arc(235, 200, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(165, 200, 4, 0, Math.PI * 2);
      ctx.arc(235, 200, 4, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = '#2b1b17';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(145, 185);
      ctx.quadraticCurveTo(165, 178, 185, 186);
      ctx.moveTo(215, 186);
      ctx.quadraticCurveTo(235, 178, 255, 185);
      ctx.stroke();

      // Nose
      ctx.strokeStyle = '#aa6c4c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(198, 195);
      ctx.lineTo(195, 230);
      ctx.lineTo(207, 232);
      ctx.stroke();

      // Lips
      ctx.fillStyle = '#b84444';
      ctx.beginPath();
      ctx.ellipse(200, 260, 24, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cybernetic circuit line on cheek
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(135, 230);
      ctx.lineTo(155, 230);
      ctx.lineTo(165, 245);
      ctx.lineTo(180, 245);
      ctx.stroke();
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(180, 243, 4, 4);

      return canvas;
    },
  },
  {
    id: 'gorillas',
    name: 'QBasic GORILLAS.BAS Tribute',
    category: 'Retro Gaming',
    description: 'City skyline with glowing yellow windows and moon from the famous 1991 MS-DOS game.',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;

      // Dark blue DOS night sky
      ctx.fillStyle = '#000088';
      ctx.fillRect(0, 0, 320, 200);

      // Moon
      ctx.fillStyle = '#ffff55';
      ctx.beginPath();
      ctx.arc(45, 35, 16, 0, Math.PI * 2);
      ctx.fill();

      // City buildings
      const buildings = [
        { x: 0, w: 35, h: 110, c: '#00aa00' },
        { x: 35, w: 40, h: 140, c: '#aa0000' },
        { x: 75, w: 45, h: 90, c: '#00aaaa' },
        { x: 120, w: 38, h: 130, c: '#aa00aa' },
        { x: 158, w: 42, h: 100, c: '#aa5500' },
        { x: 200, w: 35, h: 145, c: '#00aa00' },
        { x: 235, w: 45, h: 120, c: '#00aaaa' },
        { x: 280, w: 40, h: 80, c: '#aa0000' },
      ];

      buildings.forEach((b) => {
        const top = 200 - b.h;
        ctx.fillStyle = b.c;
        ctx.fillRect(b.x, top, b.w, b.h);

        // Windows
        for (let wy = top + 10; wy < 190; wy += 14) {
          for (let wx = b.x + 6; wx < b.x + b.w - 8; wx += 10) {
            const lit = ((wx * 7 + wy * 13) % 5) !== 0;
            ctx.fillStyle = lit ? '#ffff55' : '#000000';
            ctx.fillRect(wx, wy, 5, 8);
          }
        }
      });

      // Classic Gorillas text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('QBASIC GORILLAS', 105, 20);

      // Gorilla pixel silhouette on building
      ctx.fillStyle = '#555555';
      ctx.fillRect(50, 200 - 140 - 18, 14, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(52, 200 - 140 - 14, 3, 3);
      ctx.fillRect(58, 200 - 140 - 14, 3, 3);

      return canvas;
    },
  },
  {
    id: 'test_pattern',
    name: 'VGA / CGA Test Pattern',
    category: 'Calibration',
    description: 'RGB color bars, grayscale gradients, geometry circles, and resolution test grid.',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 320, 200);

      // 8 Top Color Bars
      const topBars = [
        '#ffffff', '#ffff00', '#00ffff', '#00ff00',
        '#ff00ff', '#ff0000', '#0000ff', '#000000',
      ];
      const barW = 320 / 8;
      topBars.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(idx * barW, 0, barW, 60);
      });

      // Grayscale ramp
      for (let x = 0; x < 320; x++) {
        const val = Math.floor((x / 320) * 255);
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(x, 60, 1, 35);
      }

      // Smooth RGB gradients
      for (let x = 0; x < 320; x++) {
        const ratio = x / 320;
        ctx.fillStyle = `rgb(${Math.floor(ratio * 255)},0,0)`;
        ctx.fillRect(x, 95, 1, 15);
        ctx.fillStyle = `rgb(0,${Math.floor(ratio * 255)},0)`;
        ctx.fillRect(x, 110, 1, 15);
        ctx.fillStyle = `rgb(0,0,${Math.floor(ratio * 255)})`;
        ctx.fillRect(x, 125, 1, 15);
      }

      // Geometry circles (test 4:3 vs 1:1 pixel aspect ratio)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(80, 165, 24, 0, Math.PI * 2);
      ctx.arc(240, 165, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Checkerboard fine pixel test
      for (let y = 145; y < 185; y += 4) {
        for (let x = 135; x < 185; x += 4) {
          if (((x + y) / 4) % 2 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y, 4, 4);
          }
        }
      }

      // Border frame
      ctx.strokeStyle = '#ffff55';
      ctx.strokeRect(1, 1, 318, 198);

      return canvas;
    },
  },
];
