import { QpdfEngine } from './qpdf/qpdfEngine';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';
import { verifyPdf } from './verifyPdf';

/**
 * Merges multiple PDF documents into a single organized PDF using QPDF WebAssembly.
 * Preserves exact page dimensions, rotations, embedded fonts, vector artwork,
 * annotations, links, and forms without destructive document reconstruction.
 */
export async function mergePdfs(
  files: File[],
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!files || files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(10, 'Reading PDF documents for merge...');

  let totalOriginalSize = 0;
  const inputBuffers: Uint8Array[] = [];
  let expectedPageCount = 0;

  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const file = files[i];
    totalOriginalSize += file.size;

    const percent = Math.round(10 + (i / files.length) * 35);
    onProgress?.(percent, `Loading file ${i + 1} of ${files.length}: ${file.name}`);

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    inputBuffers.push(bytes);

    const pages = await QpdfEngine.getPageCount(bytes);
    expectedPageCount += pages;
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(55, `Merging ${files.length} documents (${expectedPageCount} total pages)...`);
  const mergedBytes = await QpdfEngine.mergePdfs(inputBuffers);

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(85, 'Verifying merged PDF integrity...');
  const verification = await verifyPdf(mergedBytes, expectedPageCount);

  if (!verification.isValid) {
    throw new Error(
      `The PDF could not be safely processed: ${verification.errors.join(', ')}. Your original files have not been changed.`
    );
  }

  const primaryName = getBaseFileName(files[0].name);
  const fileName = `${primaryName}-merged.pdf`;
  const blob = new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Merge completed successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: totalOriginalSize,
    pageCount: expectedPageCount,
    isZip: false,
  };
}
