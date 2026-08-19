import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { OperationResult, ProgressCallback, PageNumberOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { parsePageRanges } from './pageRangeParser';
import { verifyPdf } from './verifyPdf';

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16) / 255,
      g: parseInt(clean.substring(2, 4), 16) / 255,
      b: parseInt(clean.substring(4, 6), 16) / 255,
    };
  }
  return { r: 0.2, g: 0.2, b: 0.2 };
}

/**
 * Draws page numbers onto existing PDF pages using pdf-lib.
 * Preserves exact page dimensions, rotations, vectors, fonts, and images.
 */
export async function addPageNumbersToPdf(
  file: File,
  options: PageNumberOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!file) {
    throw new Error('No PDF file provided.');
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
    const parseRes = parsePageRanges(options.customRanges || '1', totalPages, { deduplicate: true, sort: true });
    if (parseRes.error || parseRes.pages.length === 0) {
      throw new Error(parseRes.error || 'Please specify valid pages for page numbering.');
    }
    targetPages = parseRes.pages;
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const color = parseHexColor(options.color || '#333333');
  const rgbColor = rgb(color.r, color.g, color.b);
  const fontSize = options.fontSize || 10;
  const margin = options.margin || 25;
  const startNum = options.startNumber || 1;

  onProgress?.(30, `Adding page numbers to ${targetPages.length} page(s)...`);

  for (let idx = 0; idx < targetPages.length; idx++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const pageNum = targetPages[idx];
    const page = pdfDoc.getPage(pageNum - 1);
    const { width, height } = page.getSize();
    const currentNum = startNum + idx;

    let text = `${currentNum}`;
    if (options.format === 'page-n') {
      text = `Page ${currentNum}`;
    } else if (options.format === 'page-n-of-total') {
      text = `Page ${currentNum} of ${totalPages}`;
    } else if (options.format === 'n-of-total') {
      text = `${currentNum} of ${totalPages}`;
    }

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    let x = width / 2 - textWidth / 2;
    let y = margin;

    switch (options.position) {
      case 'top-left':
        x = margin;
        y = height - margin - textHeight;
        break;
      case 'top-center':
        x = width / 2 - textWidth / 2;
        y = height - margin - textHeight;
        break;
      case 'top-right':
        x = width - margin - textWidth;
        y = height - margin - textHeight;
        break;
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'bottom-center':
        x = width / 2 - textWidth / 2;
        y = margin;
        break;
      case 'bottom-right':
        x = width - margin - textWidth;
        y = margin;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgbColor,
    });
  }

  onProgress?.(85, 'Saving document...');
  const outBytes = await pdfDoc.save({ useObjectStreams: true });

  onProgress?.(95, 'Verifying document integrity...');
  const verification = await verifyPdf(outBytes, totalPages);

  if (!verification.isValid) {
    throw new Error(`The PDF could not be safely processed: ${verification.errors.join(', ')}.`);
  }

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-numbered.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Page numbers added successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
