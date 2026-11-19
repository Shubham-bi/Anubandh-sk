import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crc]);
}

/**
 * Generate a high quality RGBA PNG for Anubandh अनुबंध app icon.
 * Features:
 * - Auspicious Royal Crimson gradient squircle with golden accent ring
 * - The Sacred Anubandh Knot (Interlacing Golden & Pearl-Rose wedding bands)
 * - Radiant 4-point Mangalya star at the center knot
 * - Golden Chandrabindu / Tilak at top
 * - Silk ribbon knot tails flowing gracefully
 */
function generateAnubandhPng(size) {
  const width = size;
  const height = size;

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx1 = width * 0.38;
  const cx2 = width * 0.62;
  const cyKnot = height * 0.45;
  const ringRadius = size * 0.17;
  const ringThick = size * 0.042;
  const rInner = ringRadius - ringThick;
  const rOuter = ringRadius + ringThick;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      // 1. Squircle background geometry
      const cornerRadius = size * 0.22;
      let inCorner = false;
      const checkCorner = (cx, cy) => {
        const dx = x - cx;
        const dy = y - cy;
        return (dx * dx + dy * dy) > (cornerRadius * cornerRadius);
      };

      if (x < cornerRadius && y < cornerRadius) inCorner = checkCorner(cornerRadius, cornerRadius);
      else if (x > width - cornerRadius && y < cornerRadius) inCorner = checkCorner(width - cornerRadius, cornerRadius);
      else if (x < cornerRadius && y > height - cornerRadius) inCorner = checkCorner(cornerRadius, height - cornerRadius);
      else if (x > width - cornerRadius && y > height - cornerRadius) inCorner = checkCorner(width - cornerRadius, height - cornerRadius);

      if (inCorner) {
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        continue;
      }

      // 2. Base Royal Crimson Gradient (#9f1239 to #be123c to #4c0519)
      const diag = (x * 0.6 + y * 0.8) / (width + height);
      let r = Math.round(159 * (1 - diag) + 76 * diag);
      let g = Math.round(18 * (1 - diag) + 5 * diag);
      let b = Math.round(57 * (1 - diag) + 25 * diag);
      let a = 255;

      // Soft ambient golden center aura
      const distCenter = Math.hypot(x - width * 0.5, y - height * 0.45) / (size * 0.45);
      if (distCenter < 1) {
        const aura = Math.pow(1 - distCenter, 2) * 0.35;
        r = Math.min(255, Math.round(r + 245 * aura));
        g = Math.min(255, Math.round(g + 158 * aura));
        b = Math.min(255, Math.round(b + 11 * aura));
      }

      // Inner subtle golden border
      const borderDistX = Math.min(x, width - x);
      const borderDistY = Math.min(y, height - y);
      const minEdgeDist = Math.min(borderDistX, borderDistY);
      if (minEdgeDist >= size * 0.02 && minEdgeDist <= size * 0.028) {
        r = Math.round(r * 0.3 + 251 * 0.7);
        g = Math.round(g * 0.3 + 191 * 0.7);
        b = Math.round(b * 0.3 + 36 * 0.7);
      }

      // 3. Tilak / Chandrabindu at top (size * 0.5, size * 0.16)
      const tilakDy = (y - height * 0.16);
      const tilakDx = (x - width * 0.5);
      const tilakDist = Math.hypot(tilakDx, tilakDy);
      // Bindi dot
      if (tilakDist <= size * 0.028) {
        r = 254; g = 240; b = 138; // Bright Gold
      } else if (tilakDist <= size * 0.038) {
        // Anti-alias fringe
        const f = (tilakDist - size * 0.028) / (size * 0.01);
        r = Math.round(254 * (1 - f) + r * f);
        g = Math.round(240 * (1 - f) + g * f);
        b = Math.round(138 * (1 - f) + b * f);
      }
      // Crescent below bindi
      if (y > height * 0.18 && y < height * 0.22 && Math.abs(tilakDx) < size * 0.065) {
        const crescentY = height * 0.19 + (tilakDx * tilakDx) / (size * 0.18);
        if (Math.abs(y - crescentY) < size * 0.012) {
          r = 245; g = 158; b = 11; // Saffron Gold
        }
      }

      // 4. Two Intertwined Wedding Rings / Silk Knot (रेशीमगाठ)
      const d1 = Math.hypot(x - cx1, y - cyKnot);
      const d2 = Math.hypot(x - cx2, y - cyKnot);

      const inRing1 = d1 >= rInner && d1 <= rOuter;
      const inRing2 = d2 >= rInner && d2 <= rOuter;

      // Left Ring = Wedding Gold
      const drawRing1 = () => {
        const factor = (y - (cyKnot - ringRadius)) / (ringRadius * 2);
        r = Math.round(254 - 40 * factor);
        g = Math.round(220 - 70 * factor);
        b = Math.round(100 - 80 * factor);
      };

      // Right Ring = Radiant Pearl Rose
      const drawRing2 = () => {
        const factor = (y - (cyKnot - ringRadius)) / (ringRadius * 2);
        r = Math.round(255);
        g = Math.round(245 - 80 * factor);
        b = Math.round(248 - 60 * factor);
      };

      if (inRing1 && inRing2) {
        // Interlacing cross: Top crossing: Ring 1 over Ring 2; Bottom crossing: Ring 2 over Ring 1
        if (y < cyKnot) {
          drawRing1();
        } else {
          drawRing2();
        }
      } else if (inRing1) {
        drawRing1();
      } else if (inRing2) {
        drawRing2();
      }

      // 5. Flowing Silk Ribbon Tails (दोन घराण्यांचे रेशीमबंध)
      if (y >= cyKnot + ringRadius * 0.7 && y <= height * 0.82) {
        const prog = (y - (cyKnot + ringRadius * 0.7)) / (height * 0.28);
        // Left gold ribbon tail
        const tail1X = width * 0.5 - size * 0.03 - prog * size * 0.09;
        if (Math.abs(x - tail1X) < size * 0.024 * (1 - prog * 0.3)) {
          r = 251; g = 191; b = 36;
        }
        // Right rose-pearl ribbon tail
        const tail2X = width * 0.5 + size * 0.03 + prog * size * 0.09;
        if (Math.abs(x - tail2X) < size * 0.024 * (1 - prog * 0.3)) {
          r = 255; g = 230; b = 238;
        }
      }

      // 6. Central Sacred Silk Knot & Radiant Mangalya Star (मांगल्य तेज)
      const kdx = Math.abs(x - width * 0.5);
      const kdy = Math.abs(y - cyKnot);

      // Central knot diamond
      if (kdx + kdy < size * 0.055) {
        r = 254; g = 240; b = 138; // Bright Gold Knot
      }

      // 4-point radiant sparkle
      const starV = (kdx < size * 0.016 && kdy < size * 0.075);
      const starH = (kdy < size * 0.016 && kdx < size * 0.075);
      const starCenter = Math.hypot(kdx, kdy) < size * 0.022;

      if (starCenter) {
        r = 255; g = 255; b = 255; // Brilliant White Core
      } else if (starV || starH) {
        const decay = Math.max(kdx / (size * 0.075), kdy / (size * 0.075));
        const intensity = 1 - decay;
        r = Math.min(255, Math.round(r * (1 - intensity) + 255 * intensity));
        g = Math.min(255, Math.round(g * (1 - intensity) + 250 * intensity));
        b = Math.min(255, Math.round(b * (1 - intensity) + 200 * intensity));
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

console.log('Generating Anubandh PWA Icons...');

const pwa192 = generateAnubandhPng(192);
fs.writeFileSync('./public/pwa-192x192.png', pwa192);
console.log('✓ Generated public/pwa-192x192.png (' + pwa192.length + ' bytes)');

const pwa512 = generateAnubandhPng(512);
fs.writeFileSync('./public/pwa-512x512.png', pwa512);
console.log('✓ Generated public/pwa-512x512.png (' + pwa512.length + ' bytes)');

const appleTouch = generateAnubandhPng(180);
fs.writeFileSync('./public/apple-touch-icon.png', appleTouch);
console.log('✓ Generated public/apple-touch-icon.png (' + appleTouch.length + ' bytes)');

// Also generate 64x64 favicon.ico replacement
const favPng = generateAnubandhPng(64);
fs.writeFileSync('./public/favicon.ico', favPng);
console.log('✓ Generated public/favicon.ico (' + favPng.length + ' bytes)');

console.log('All Anubandh app icons successfully generated!');
