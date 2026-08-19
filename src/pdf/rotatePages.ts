import { QpdfEngine } from './qpdf/qpdfEngine';
import type { OperationResult, ProgressCallback, RotateOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { parsePageRanges } from './pageRangeParser';
import { verifyPdf } from './verifyPdf';

/**
 * Rotates PDF pages at the PDF level using QPDF WebAssembly.
 * Preserves all page boxes (MediaBox, CropBox, BleedBox, TrimBox, ArtBox),
 * fonts, vector streams, and annotations without rasterizing or reconstructing pages.
 */
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

  onProgress?.(10, 'Reading PDF document for rotation...');
  const fileBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(fileBuffer);
  const totalPages = await QpdfEngine.getPageCount(rawBytes);

  let targetPages: number[] | undefined;
  if (options.pagesMode === 'custom') {
    const parseRes = parsePageRanges(options.customRanges || '1', totalPages, { deduplicate: true, sort: true });
    if (parseRes.error || parseRes.pages.length === 0) {
      throw new Error(parseRes.error || 'Please specify valid pages to rotate.');
    }
    targetPages = parseRes.pages;
  }

  const rotationDelta = options.rotation; // 90, 180, or 270
  onProgress?.(40, `Applying +${rotationDelta}° rotation with QPDF...`);

  const rotatedBytes = await QpdfEngine.rotatePages(rawBytes, {
    angle: rotationDelta as 90 | 180 | 270,
    pages: targetPages,
  });

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(80, 'Verifying rotated PDF integrity...');
  const verification = await verifyPdf(rotatedBytes, totalPages);

  if (!verification.isValid) {
    throw new Error(
      `The PDF could not be safely processed: ${verification.errors.join(', ')}. Your original file has not been changed.`
    );
  }

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-rotated.pdf`;
  const blob = new Blob([rotatedBytes as BlobPart], { type: 'application/pdf' });

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
