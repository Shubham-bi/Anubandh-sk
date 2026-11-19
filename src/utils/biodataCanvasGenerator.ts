import { SHUBHAM_BIODATA, GANESH_IMG_DATA } from '../data/shubhamBiodataData';

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

/**
 * Dynamically renders the complete high-resolution biodata card on an HTML5 Canvas
 * Exactly matching src/data/shubham_biodata_redesigned.html
 */
export async function renderBiodataCanvas(): Promise<HTMLCanvasElement> {
  const width = 724;
  const height = 1040;
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

  // 2. Borders matching reference sheet (border: 2px solid #222222; outline: 1px solid #444444; outline-offset: -5px)
  // Outer Border
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  // Inner Border with 5px offset
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 1;
  ctx.strokeRect(11, 11, width - 22, height - 22);

  // 3. Four Corner Ornamental Flourishes
  drawCornerFlourish(ctx, 11, 11, 0.8, 0.8);
  drawCornerFlourish(ctx, width - 11, 11, -0.8, 0.8);
  drawCornerFlourish(ctx, 11, height - 11, 0.8, -0.8);
  drawCornerFlourish(ctx, width - 11, height - 11, -0.8, -0.8);

  // 4. Header: Shri Ganesh Icon
  let currentY = 36;
  try {
    const ganeshImg = await loadImage(GANESH_IMG_DATA);
    const ganeshW = 66;
    const ganeshH = 66;
    ctx.drawImage(ganeshImg, (width - ganeshW) / 2, currentY, ganeshW, ganeshH);
    currentY += ganeshH + 8;
  } catch {
    currentY += 40;
  }

  // Invocation Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
  ctx.fillText(SHUBHAM_BIODATA.invocation, width / 2, currentY);
  currentY += 24;

  const labelX = 145;
  const colonX = 285;
  const valueX = 305;
  const rowHeight = 24.5;

  // 5. Section 1: Personal Information (वैयक्तिक माहिती)
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(SHUBHAM_BIODATA.personalTitle, width / 2, currentY);
  currentY += 18;

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
      currentY += 18;
      ctx.font = '400 14px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(field.subvalue, valueX, currentY);
    }

    currentY += rowHeight;
  }

  currentY += 8;

  // 6. Section 2: Family Information (कौटुंबिक माहिती)
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(SHUBHAM_BIODATA.familyTitle, width / 2, currentY);
  currentY += 18;

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

  currentY += 8;

  // 7. Section 3: Contact Details (संपर्क)
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(SHUBHAM_BIODATA.contactTitle, width / 2, currentY);
  currentY += 18;

  for (const contact of SHUBHAM_BIODATA.contacts) {
    ctx.textAlign = 'center';
    ctx.font = '500 14.5px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`${contact.name}, ${contact.place}`, width / 2, currentY);
    currentY += 19;

    ctx.font = '500 14px "Noto Sans Devanagari", "Nirmala UI", "Mangal", sans-serif';
    ctx.fillText(contact.phone, width / 2, currentY);
    currentY += 21;
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
    const file = new File([blob], 'shubham_biodata_redesigned.png', { type: 'image/png' });
    return { canvas, dataUrl, blob, file };
  })();

  return cachedImagePromise;
}

/**
 * Triggers instant download of the biodata canvas card as PNG
 */
export async function downloadBiodataCanvasImage(): Promise<void> {
  const { dataUrl } = await getGeneratedBiodataImage();
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'shubham_biodata_redesigned.png';
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
