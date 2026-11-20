/**
 * imageCompressor.ts - Client-side image optimization for Anubandh
 * Compresses any user-selected image into high-performance, lightweight WebP/JPEG data URL.
 */

export interface CompressionResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeKb: number;
}

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

/**
 * Reads a File object as an HTMLImageElement
 */
function readFileAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Failed to load image: ' + String(err)));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(new Error('Failed to read file: ' + String(err)));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file to an optimized WebP (or JPEG fallback) data URL
 * Target size is typically ~30 KB - 50 KB.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 480,
    maxHeight = 620,
    quality = 0.82,
    format = 'image/webp'
  } = options;

  const img = await readFileAsImage(file);
  let targetWidth = img.width;
  let targetHeight = img.height;

  // Calculate constrained aspect ratio
  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratioX = maxWidth / targetWidth;
    const ratioY = maxHeight / targetHeight;
    const ratio = Math.min(ratioX, ratioY);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Ensure minimum viable dimensions
  targetWidth = Math.max(120, targetWidth);
  targetHeight = Math.max(150, targetHeight);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  // Better image scaling quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill background white in case of transparent PNGs
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Draw scaled image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Attempt WebP first; fallback to JPEG if browser doesn't support WebP export
  let dataUrl = canvas.toDataURL(format, quality);
  if (!dataUrl.startsWith(`data:${format}`)) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  // Calculate size in KB
  // Base64 size estimation: (string length * 3/4) / 1024
  const sizeKb = Math.round((dataUrl.length * 0.75) / 10.24) / 100;

  return {
    dataUrl,
    width: targetWidth,
    height: targetHeight,
    sizeKb
  };
}
