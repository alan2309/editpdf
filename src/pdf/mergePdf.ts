import { PDFDocument } from 'pdf-lib';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';

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

  onProgress?.(5, 'Creating new merged PDF document...');
  const mergedPdf = await PDFDocument.create();

  let totalOriginalSize = 0;
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const file = files[i];
    totalOriginalSize += file.size;

    const percent = Math.round(10 + (i / totalFiles) * 80);
    onProgress?.(percent, `Processing file ${i + 1} of ${totalFiles}: ${file.name}`);

    const fileBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);

    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  onProgress?.(95, 'Saving merged PDF...');
  const mergedBytes = await mergedPdf.save();
  const pageCount = mergedPdf.getPageCount();

  const primaryName = getBaseFileName(files[0].name);
  const fileName = `${primaryName}-merged.pdf`;
  const blob = new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Merge completed successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: totalOriginalSize,
    pageCount,
    isZip: false,
  };
}
