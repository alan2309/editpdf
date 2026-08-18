import { PDFDocument } from 'pdf-lib';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';

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

  onProgress?.(10, 'Loading PDF document...');
  const fileBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  if (!newPageOrder || newPageOrder.length === 0) {
    throw new Error('No page order provided.');
  }

  // Validate every page in newPageOrder is within 1..totalPages
  for (const p of newPageOrder) {
    if (p < 1 || p > totalPages) {
      throw new Error(`Invalid page index ${p}. Document has ${totalPages} pages.`);
    }
  }

  onProgress?.(40, `Reordering ${newPageOrder.length} page(s)...`);
  const outDoc = await PDFDocument.create();
  const zeroIndices = newPageOrder.map(p => p - 1);
  const copiedPages = await outDoc.copyPages(srcDoc, zeroIndices);

  copiedPages.forEach(p => outDoc.addPage(p));

  onProgress?.(80, 'Saving reordered PDF...');
  const outBytes = await outDoc.save();

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-reordered.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

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
