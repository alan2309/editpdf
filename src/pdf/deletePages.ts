import { PDFDocument } from 'pdf-lib';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';
import { parsePageRanges } from './pageRangeParser';

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

  onProgress?.(10, 'Loading PDF document...');
  const fileBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

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

  onProgress?.(40, `Deleting ${parseRes.pages.length} page(s), keeping ${remainingPages.length} page(s)...`);
  const outDoc = await PDFDocument.create();
  const zeroIndices = remainingPages.map(p => p - 1);
  const copiedPages = await outDoc.copyPages(srcDoc, zeroIndices);

  copiedPages.forEach(p => outDoc.addPage(p));

  onProgress?.(80, 'Saving document...');
  const outBytes = await outDoc.save();

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-modified.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

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
