import { SHUBHAM_BIODATA, GANESH_IMG_DATA } from '../constants/shubhamBiodataData';

/**
 * Loads an image from a data URI or URL as an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Draws ornamental corner flourishes matching the reference design
 */
function drawCornerFlourish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);

  // Outer arcs
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(8, 100);
  ctx.bezierCurveTo(8, 75, 12, 55, 22, 40);
  ctx.bezierCurveTo(32, 25, 45, 16, 65, 12);
  ctx.bezierCurveTo(80, 9, 95, 8, 104, 8);
  ctx.stroke();

  // Secondary arc
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12, 85);
  ctx.bezierCurveTo(12, 65, 18, 48, 30, 35);
  ctx.bezierCurveTo(42, 22, 58, 14, 85, 12);
  ctx.stroke();

  // Corner loops
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(17, 17, 7, 0, Math.PI * 2);
  ctx.stroke();

  // Center petal flourish
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.moveTo(18, 18);
  ctx.quadraticCurveTo(38, 38, 52, 52);
  ctx.quadraticCurveTo(40, 46, 28, 34);
  ctx.closePath();
  ctx.fill();

  // Decorative dots
  const dots = [
    { cx: 28, cy: 28, r: 3.2, color: '#222222' },
    { cx: 48, cy: 18, r: 2.4, color: '#333333' },
    { cx: 18, cy: 48, r: 2.4, color: '#333333' },
    { cx: 72, cy: 14, r: 2.0, color: '#444444' },
    { cx: 14, cy: 72, r: 2.0, color: '#444444' },
    { cx: 94, cy: 10, r: 1.8, color: '#555555' },
    { cx: 10, cy: 94, r: 1.8, color: '#555555' }
  ];

  for (const dot of dots) {
    ctx.fillStyle = dot.color;
    ctx.beginPath();
    ctx.arc(dot.cx, dot.cy, dot.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export interface GeneratedBiodataImage {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  blob: Blob;
  file: File;
}

let cachedImagePromise: Promise<GeneratedBiodataImage> | null = null;

export function clearBiodataCanvasCache() {
  cachedImagePromise = null;
}

export function getStoredGroomPhoto(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('anubandh_groom_photo_v1');
  } catch {
    return null;
  }
}

/**
 * Dynamically renders the complete high-resolution biodata card on an HTML5 Canvas
 * Exactly matching src/data/shubham_biodata_redesigned.html
 */
export async function renderBiodataCanvas(): Promise<HTMLCanvasElement> {
  const width = 740;
  const height = 1050;
  const scale = 2; // 2x retina crispness

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2d context');

  ctx.scale(scale, scale);

  // 1. Background Paper
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Borders with outer margin space around the card
  const outerPad = 18; // Margin outside border
  const innerPad = outerPad + 6; // 24px

  // Outer Border
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 2;
  ctx.strokeRect(outerPad, outerPad, width - (outerPad * 2), height - (outerPad * 2));

  // Inner Border with 6px offset
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 1;
  ctx.strokeRect(innerPad, innerPad, width - (innerPad * 2), height - (innerPad * 2));

  // 3. Four Corner Ornamental Flourishes anchored at inner border
  drawCornerFlourish(ctx, innerPad, innerPad, 0.8, 0.8);
  drawCornerFlourish(ctx, width - innerPad, innerPad, -0.8, 0.8);
  drawCornerFlourish(ctx, innerPad, height - innerPad, 0.8, -0.8);
  drawCornerFlourish(ctx, width - innerPad, height - innerPad, -0.8, -0.8);

  // 4. Header: Shri Ganesh Icon with generous top margin
  let currentY = 66;
  try {
    const ganeshImg = await loadImage(GANESH_IMG_DATA);
    const ganeshW = 68;
    const ganeshH = 68;
    ctx.drawImage(ganeshImg, (width - ganeshW) / 2, currentY, ganeshW, ganeshH);
    currentY += ganeshH + 14;
  } catch {
    currentY += 72;
  }

  // Invocation Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18.5px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
  ctx.fillText(SHUBHAM_BIODATA.invocation, width / 2, currentY);
  currentY += 34;

  // 4.5. Optional Groom Portrait Photo (Upper Right of Personal Section)
  const groomPhotoSrc = getStoredGroomPhoto();
  if (groomPhotoSrc) {
    try {
      const groomImg = await loadImage(groomPhotoSrc);
      const photoW = 132;
      const photoH = 168;
      const photoX = width - innerPad - 22 - photoW;
      const photoY = 150;

      // Draw photo container background & clip
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(photoX, photoY, photoW, photoH);

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(photoX, photoY, photoW, photoH, 3);
      } else {
        ctx.rect(photoX, photoY, photoW, photoH);
      }
      ctx.clip();

      // Aspect fill the image
      const imgRatio = groomImg.width / groomImg.height;
      const frameRatio = photoW / photoH;
      let drawW = photoW;
      let drawH = photoH;
      let drawX = photoX;
      let drawY = photoY;

      if (imgRatio > frameRatio) {
        drawW = photoH * imgRatio;
        drawX = photoX - (drawW - photoW) / 2;
      } else {
        drawH = photoW / imgRatio;
        drawY = photoY - (drawH - photoH) / 2;
      }
      ctx.drawImage(groomImg, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Outer border around photo
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(photoX, photoY, photoW, photoH);

      // Inner subtle border matching Marathi Patrika styling
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(photoX + 2.5, photoY + 2.5, photoW - 5, photoH - 5);
    } catch (e) {
      console.warn('Could not draw groom photo on canvas:', e);
    }
  }

  const labelX = 148;
  const colonX = 292;
  const valueX = 312;
  const rowHeight = 29.5;

  // 5. Section 1: Personal Information (वैयक्तिक माहिती)
  ctx.textAlign = 'center';
  ctx.font = 'bold 18.5px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(SHUBHAM_BIODATA.personalTitle, width / 2, currentY);
  currentY += 25;

  for (const field of SHUBHAM_BIODATA.personal) {
    // Label
    ctx.textAlign = 'left';
    ctx.font = '500 15px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(field.label, labelX, currentY);

    // Colon
    ctx.fillText(':', colonX, currentY);

    // Value
    ctx.font = '500 15px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
    ctx.fillText(field.value, valueX, currentY);

    if (field.subvalue) {
      currentY += 19;
      ctx.font = '400 14px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(field.subvalue, valueX, currentY);
    }

    currentY += rowHeight;
  }

  currentY += 10;

  // 6. Section 2: Family Information (कौटुंबिक माहिती)
  ctx.textAlign = 'center';
  ctx.font = 'bold 18.5px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(SHUBHAM_BIODATA.familyTitle, width / 2, currentY);
  currentY += 25;

  for (const field of SHUBHAM_BIODATA.family) {
    ctx.textAlign = 'left';
    ctx.font = '500 15px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(field.label, labelX, currentY);

    ctx.fillText(':', colonX, currentY);

    ctx.font = '500 15px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
    ctx.fillText(field.value, valueX, currentY);

    currentY += rowHeight;
  }

  currentY += 10;

  // 7. Section 3: Contact Details (संपर्क)
  ctx.textAlign = 'center';
  ctx.font = 'bold 18.5px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(SHUBHAM_BIODATA.contactTitle, width / 2, currentY);
  currentY += 24;

  for (let i = 0; i < SHUBHAM_BIODATA.contacts.length; i++) {
    const contact = SHUBHAM_BIODATA.contacts[i];
    ctx.textAlign = 'center';
    ctx.font = '500 14.5px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`${contact.name}, ${contact.place}`, width / 2, currentY);
    currentY += 19;

    ctx.font = '500 14px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
    ctx.fillText(contact.phone, width / 2, currentY);

    if (i < SHUBHAM_BIODATA.contacts.length - 1) {
      currentY += 21;
    }
  }

  return canvas;
}

/**
 * Prepares and caches the high-resolution biodata image for instant download / sharing
 */
export async function getGeneratedBiodataImage(forceRefresh = false): Promise<GeneratedBiodataImage> {
  if (cachedImagePromise && !forceRefresh) {
    return cachedImagePromise;
  }

  cachedImagePromise = (async () => {
    const canvas = await renderBiodataCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png');
    });
    const file = new File([blob], 'Shubham-Kharche.png', { type: 'image/png' });
    return { canvas, dataUrl, blob, file };
  })();

  return cachedImagePromise;
}

/**
 * Triggers instant download of the biodata canvas card as PNG
 */
export async function downloadBiodataCanvasImage(): Promise<void> {
  const { dataUrl } = await getGeneratedBiodataImage(true);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'Shubham-Kharche.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Copies the biodata canvas card directly to user's system clipboard as an image
 */
export async function copyBiodataCanvasToClipboard(): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return false;
    }
    const { blob } = await getGeneratedBiodataImage();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch (err) {
    console.error('Failed to copy biodata image to clipboard:', err);
    return false;
  }
}
