import { PDFDocument } from 'pdf-lib';
import type { OperationResult, ProgressCallback, SplitOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { parseSplitGroups } from './pageRangeParser';
import { createZip } from './zip';

export async function splitPdf(
  file: File,
  options: SplitOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(5, 'Loading PDF document...');
  const fileBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const baseName = getBaseFileName(file.name);

  if (totalPages === 0) {
    throw new Error('This PDF has no pages.');
  }

  // Determine split bundles
  let bundles: { name: string; pages: number[] }[] = [];

  if (options.mode === 'every-page') {
    for (let p = 1; p <= totalPages; p++) {
      bundles.push({
        name: `${baseName}-page-${p}.pdf`,
        pages: [p],
      });
    }
  } else if (options.mode === 'every-n-pages') {
    const n = Math.max(1, options.everyN || 1);
    let chunkIndex = 1;
    for (let start = 1; start <= totalPages; start += n) {
      const end = Math.min(start + n - 1, totalPages);
      const pageList: number[] = [];
      for (let p = start; p <= end; p++) {
        pageList.push(p);
      }
      bundles.push({
        name: `${baseName}-pages-${start}-${end}.pdf`,
        pages: pageList,
      });
      chunkIndex++;
    }
  } else if (options.mode === 'ranges') {
    const groupRes = parseSplitGroups(options.ranges || '1', totalPages);
    if (groupRes.error || groupRes.groups.length === 0) {
      throw new Error(groupRes.error || 'Invalid range definition.');
    }

    groupRes.groups.forEach((group, idx) => {
      const label = group.length === 1 ? `page-${group[0]}` : `part-${idx + 1}`;
      bundles.push({
        name: `${baseName}-${label}.pdf`,
        pages: group,
      });
    });
  }

  if (bundles.length === 0) {
    throw new Error('No pages were selected to split.');
  }

  // If only 1 bundle exists, return as direct PDF
  if (bundles.length === 1) {
    onProgress?.(40, 'Generating single split PDF...');
    const outDoc = await PDFDocument.create();
    const indices0 = bundles[0].pages.map(p => p - 1);
    const copied = await outDoc.copyPages(srcDoc, indices0);
    copied.forEach(p => outDoc.addPage(p));

    const outBytes = await outDoc.save();
    const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });
    onProgress?.(100, 'Split completed!');

    return {
      blob,
      fileName: bundles[0].name,
      fileSize: blob.size,
      originalSize: file.size,
      pageCount: bundles[0].pages.length,
      isZip: false,
    };
  }

  // Multiple outputs -> package into ZIP archive
  const zipFiles: { name: string; data: Uint8Array }[] = [];
  const totalBundles = bundles.length;

  for (let i = 0; i < totalBundles; i++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const b = bundles[i];
    const percent = Math.round(15 + (i / totalBundles) * 75);
    onProgress?.(percent, `Generating ${b.name} (${i + 1}/${totalBundles})...`);

    const outDoc = await PDFDocument.create();
    const zeroIndices = b.pages.map(p => p - 1);
    const copied = await outDoc.copyPages(srcDoc, zeroIndices);
    copied.forEach(p => outDoc.addPage(p));

    const bytes = await outDoc.save();
    zipFiles.push({
      name: b.name,
      data: bytes,
    });
  }

  onProgress?.(95, 'Archiving split PDFs into ZIP...');
  const zipData = createZip(zipFiles);
  const zipBlob = new Blob([zipData as BlobPart], { type: 'application/zip' });

  onProgress?.(100, 'Split completed successfully!');

  return {
    blob: zipBlob,
    fileName: `${baseName}-split.zip`,
    fileSize: zipBlob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: true,
  };
}
