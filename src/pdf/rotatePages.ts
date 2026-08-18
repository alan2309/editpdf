import { PDFDocument, degrees } from 'pdf-lib';
import type { OperationResult, ProgressCallback, RotateOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { parsePageRanges } from './pageRangeParser';

export async function rotatePages(
  file: File,
  options: RotateOptions,
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
    const parseRes = parsePageRanges(options.customRanges || '1', totalPages);
    if (parseRes.error || parseRes.pages.length === 0) {
      throw new Error(parseRes.error || 'Please specify valid pages to rotate.');
    }
    targetPages = parseRes.pages;
  }

  const rotationDelta = options.rotation; // 90, 180, or 270

  onProgress?.(40, `Rotating ${targetPages.length} page(s) by ${rotationDelta}°...`);

  targetPages.forEach(p => {
    const page = pdfDoc.getPage(p - 1);
    const currentAngle = page.getRotation().angle;
    const nextAngle = (currentAngle + rotationDelta) % 360;
    page.setRotation(degrees(nextAngle));
  });

  onProgress?.(80, 'Saving rotated PDF...');
  const outBytes = await pdfDoc.save();

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-rotated.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Rotation completed successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
