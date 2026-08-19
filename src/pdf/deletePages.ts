import { QpdfEngine } from './qpdf/qpdfEngine';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';
import { parsePageRanges } from './pageRangeParser';
import { verifyPdf } from './verifyPdf';

/**
 * Removes specified pages from a PDF document using QPDF WebAssembly.
 * Preserves exact page dimensions, rotations, vectors, fonts, and annotations.
 */
export async function deletePages(
  file: File,
  pagesToDeleteStr: string,
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

  const parseRes = parsePageRanges(pagesToDeleteStr, totalPages, { deduplicate: true, sort: true });
  if (parseRes.error || parseRes.pages.length === 0) {
    throw new Error(parseRes.error || 'Please specify valid pages to delete.');
  }

  const deleteSet = new Set(parseRes.pages);
  const remainingPages: number[] = [];

  for (let p = 1; p <= totalPages; p++) {
    if (!deleteSet.has(p)) {
      remainingPages.push(p);
    }
  }

  if (remainingPages.length === 0) {
    throw new Error('You cannot delete all pages in a document. At least one page must remain.');
  }

  onProgress?.(40, `Removing ${parseRes.pages.length} page(s), retaining ${remainingPages.length} page(s)...`);
  const modifiedBytes = await QpdfEngine.extractPages(rawBytes, { pages: remainingPages });

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(80, 'Verifying document integrity...');
  const verification = await verifyPdf(modifiedBytes, remainingPages.length);

  if (!verification.isValid) {
    throw new Error(
      `The PDF could not be safely processed: ${verification.errors.join(', ')}. Your original file has not been changed.`
    );
  }

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-modified.pdf`;
  const blob = new Blob([modifiedBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Selected pages removed successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: remainingPages.length,
    isZip: false,
  };
}
