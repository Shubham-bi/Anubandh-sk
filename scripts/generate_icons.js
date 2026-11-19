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

function generatePng(size) {
  const width = size;
  const height = size;

  // IHDR: width(4), height(4), bitDepth(1), colorType(1)=RGBA, compression(1)=0, filter(1)=0, interlace(1)=0
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Scanlines with 1 filter byte per line
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      // Gradient background from #e11d48 (225, 29, 72) to #fb7185 (251, 113, 133)
      const t = (x + y) / (width + height);
      let r = Math.round(225 + (251 - 225) * t);
      let g = Math.round(29 + (113 - 29) * t);
      let b = Math.round(72 + (133 - 72) * t);
      let a = 255;

      // Rounded rectangle corners
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
        a = 0;
      }

      // Draw simple heart in center
      const nx = (x - width / 2) / (size * 0.35);
      const ny = -(y - height / 2 + size * 0.05) / (size * 0.35);
      // Heart formula: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      if (a > 0) {
        const hVal = Math.pow(nx * nx + ny * ny - 0.7, 3) - (nx * nx) * Math.pow(ny, 3);
        if (hVal <= 0) {
          r = 255;
          g = 255;
          b = 255;
        }
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

const pwa192 = generatePng(192);
fs.writeFileSync('public/pwa-192x192.png', pwa192);
console.log('Generated public/pwa-192x192.png (' + pwa192.length + ' bytes)');

const pwa512 = generatePng(512);
fs.writeFileSync('public/pwa-512x512.png', pwa512);
fs.writeFileSync('public/apple-touch-icon.png', pwa512);
console.log('Generated public/pwa-512x512.png & apple-touch-icon.png (' + pwa512.length + ' bytes)');
