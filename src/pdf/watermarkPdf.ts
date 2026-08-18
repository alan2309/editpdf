import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import type { OperationResult, ProgressCallback, WatermarkOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { parsePageRanges } from './pageRangeParser';

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16) / 255,
      g: parseInt(clean.substring(2, 4), 16) / 255,
      b: parseInt(clean.substring(4, 6), 16) / 255,
    };
  }
  return { r: 0.8, g: 0.1, b: 0.1 };
}

export async function addWatermarkToPdf(
  file: File,
  options: WatermarkOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  if (!options.text || !options.text.trim()) {
    throw new Error('Watermark text cannot be empty.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(10, 'Loading PDF document...');
  const fileBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  let targetPages: number[] = [];
  if (options.pagesMode === 'all') {
    targetPages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const parseRes = parsePageRanges(options.customRanges || '1', totalPages);
    if (parseRes.error || parseRes.pages.length === 0) {
      throw new Error(parseRes.error || 'Please specify valid pages for watermark.');
    }
    targetPages = parseRes.pages;
  }

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const color = parseHexColor(options.color || '#dc2626');
  const rgbColor = rgb(color.r, color.g, color.b);
  const fontSize = options.fontSize || 36;
  const opacity = Math.max(0.05, Math.min(1.0, options.opacity ?? 0.35));
  const rotation = options.rotation ?? 45;

  onProgress?.(30, `Applying watermark to ${targetPages.length} page(s)...`);

  for (const pageNum of targetPages) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const page = pdfDoc.getPage(pageNum - 1);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    let x = width / 2 - textWidth / 2;
    let y = height / 2 - textHeight / 2;

    switch (options.position) {
      case 'top-left':
        x = 50;
        y = height - 50 - textHeight;
        break;
      case 'top-center':
        x = width / 2 - textWidth / 2;
        y = height - 50 - textHeight;
        break;
      case 'top-right':
        x = width - 50 - textWidth;
        y = height - 50 - textHeight;
        break;
      case 'bottom-left':
        x = 50;
        y = 50;
        break;
      case 'bottom-center':
        x = width / 2 - textWidth / 2;
        y = 50;
        break;
      case 'bottom-right':
        x = width - 50 - textWidth;
        y = 50;
        break;
      case 'center':
      default:
        x = width / 2 - textWidth / 2;
        y = height / 2 - textHeight / 2;
        break;
    }

    page.drawText(options.text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgbColor,
      opacity,
      rotate: degrees(rotation),
    });
  }

  onProgress?.(85, 'Saving watermarked document...');
  const outBytes = await pdfDoc.save();

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-watermarked.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Watermark applied successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
