import { PDFDocument } from 'pdf-lib';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';
import { parsePageRanges } from './pageRangeParser';

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

  onProgress?.(10, 'Loading PDF document...');
  const fileBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const parseRes = parsePageRanges(pageRangeStr, totalPages, { deduplicate: true, sort: false });
  if (parseRes.error || parseRes.pages.length === 0) {
    throw new Error(parseRes.error || 'Please specify valid pages to extract.');
  }

  onProgress?.(30, `Extracting ${parseRes.pages.length} page(s)...`);
  const outDoc = await PDFDocument.create();
  const zeroIndices = parseRes.pages.map(p => p - 1);
  const copiedPages = await outDoc.copyPages(srcDoc, zeroIndices);

  copiedPages.forEach(p => outDoc.addPage(p));

  onProgress?.(80, 'Saving extracted PDF...');
  const outBytes = await outDoc.save();

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-extracted.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

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
