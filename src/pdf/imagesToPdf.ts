import { PDFDocument } from 'pdf-lib';
import type { OperationResult, ProgressCallback, ImageToPdfOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { verifyPdf } from './verifyPdf';

// Standard Page Dimensions in Points (72 points = 1 inch)
const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.0, height: 792.0 },
};

/**
 * Converts image files (JPG/PNG) into a PDF document using pdf-lib.
 * Handles aspect ratio preserving scaling (contain/cover/original) and
 * clean backgrounds for transparency.
 */
export async function convertImagesToPdf(
  files: File[],
  options: ImageToPdfOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!files || files.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(5, 'Creating PDF document from images...');
  const pdfDoc = await PDFDocument.create();

  let totalOriginalSize = 0;
  const totalImages = files.length;

  for (let i = 0; i < totalImages; i++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const file = files[i];
    totalOriginalSize += file.size;

    const percent = Math.round(10 + (i / totalImages) * 75);
    onProgress?.(percent, `Embedding image ${i + 1} of ${totalImages}: ${file.name}`);

    const buffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    let embeddedImage;
    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(buffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(buffer);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let targetPageWidth = imgWidth;
    let targetPageHeight = imgHeight;

    if (options.pageSize === 'a4' || options.pageSize === 'letter') {
      const standard = PAGE_SIZES[options.pageSize];
      if (options.orientation === 'landscape' || (options.orientation === 'auto' && imgWidth > imgHeight)) {
        targetPageWidth = standard.height;
        targetPageHeight = standard.width;
      } else {
        targetPageWidth = standard.width;
        targetPageHeight = standard.height;
      }
    }

    const margin = options.margin || 0;
    const usableWidth = Math.max(10, targetPageWidth - margin * 2);
    const usableHeight = Math.max(10, targetPageHeight - margin * 2);

    let drawW = imgWidth;
    let drawH = imgHeight;

    if (options.fit === 'contain' || options.pageSize === 'a4' || options.pageSize === 'letter') {
      const scaleW = usableWidth / imgWidth;
      const scaleH = usableHeight / imgHeight;
      const fitScale = Math.min(scaleW, scaleH);
      drawW = imgWidth * fitScale;
      drawH = imgHeight * fitScale;
    } else if (options.fit === 'cover') {
      const scaleW = usableWidth / imgWidth;
      const scaleH = usableHeight / imgHeight;
      const fitScale = Math.max(scaleW, scaleH);
      drawW = imgWidth * fitScale;
      drawH = imgHeight * fitScale;
    }

    const page = pdfDoc.addPage([targetPageWidth, targetPageHeight]);
    const drawX = margin + (usableWidth - drawW) / 2;
    const drawY = margin + (usableHeight - drawH) / 2;

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });
  }

  onProgress?.(88, 'Saving generated PDF...');
  const outBytes = await pdfDoc.save({ useObjectStreams: true });

  onProgress?.(95, 'Verifying PDF integrity...');
  const verification = await verifyPdf(outBytes, totalImages);

  if (!verification.isValid) {
    throw new Error(`The PDF could not be safely created: ${verification.errors.join(', ')}.`);
  }

  const baseName = getBaseFileName(files[0].name);
  const fileName = totalImages > 1 ? `${baseName}-images.pdf` : `${baseName}.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'PDF created successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: totalOriginalSize,
    pageCount: totalImages,
    isZip: false,
  };
}
