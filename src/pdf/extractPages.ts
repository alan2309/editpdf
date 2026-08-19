import { QpdfEngine } from './qpdf/qpdfEngine';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';
import { parsePageRanges } from './pageRangeParser';
import { verifyPdf } from './verifyPdf';

/**
 * Extracts specific pages into a new PDF document using QPDF WebAssembly.
 * Preserves exact page dimensions, rotations, vectors, fonts, and annotations.
 */
export async function extractPages(
  file: File,
  pageRangeStr: string,
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

  const parseRes = parsePageRanges(pageRangeStr, totalPages, { deduplicate: true, sort: false });
  if (parseRes.error || parseRes.pages.length === 0) {
    throw new Error(parseRes.error || 'Please specify valid pages to extract.');
  }

  onProgress?.(40, `Extracting ${parseRes.pages.length} page(s) with QPDF...`);
  const extractedBytes = await QpdfEngine.extractPages(rawBytes, { pages: parseRes.pages });

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(80, 'Verifying extracted PDF integrity...');
  const verification = await verifyPdf(extractedBytes, parseRes.pages.length);

  if (!verification.isValid) {
    throw new Error(
      `The PDF could not be safely processed: ${verification.errors.join(', ')}. Your original file has not been changed.`
    );
  }

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-extracted.pdf`;
  const blob = new Blob([extractedBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Pages extracted successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: parseRes.pages.length,
    isZip: false,
  };
}
