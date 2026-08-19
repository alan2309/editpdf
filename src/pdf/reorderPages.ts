import { QpdfEngine } from './qpdf/qpdfEngine';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';
import { verifyPdf } from './verifyPdf';

/**
 * Reorders pages in a PDF document using QPDF WebAssembly.
 * Preserves exact page dimensions, rotations, vectors, fonts, and annotations.
 */
export async function reorderPages(
  file: File,
  newPageOrder: number[], // 1-indexed page numbers in new sequence
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(10, 'Reading PDF document...');
  const fileBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(fileBuffer);
  const totalPages = await QpdfEngine.getPageCount(rawBytes);

  if (!newPageOrder || newPageOrder.length === 0) {
    throw new Error('No page order provided.');
  }

  // Validate bounds
  for (const p of newPageOrder) {
    if (p < 1 || p > totalPages) {
      throw new Error(`Invalid page index ${p}. Document has ${totalPages} pages.`);
    }
  }

  onProgress?.(40, `Reordering ${newPageOrder.length} page(s) with QPDF...`);
  const reorderedBytes = await QpdfEngine.reorderPages(rawBytes, newPageOrder);

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(80, 'Verifying reordered PDF integrity...');
  const verification = await verifyPdf(reorderedBytes, newPageOrder.length);

  if (!verification.isValid) {
    throw new Error(
      `The PDF could not be safely processed: ${verification.errors.join(', ')}. Your original file has not been changed.`
    );
  }

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-reordered.pdf`;
  const blob = new Blob([reorderedBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Pages reordered successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: newPageOrder.length,
    isZip: false,
  };
}
