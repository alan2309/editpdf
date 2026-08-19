import { QpdfEngine } from './qpdf/qpdfEngine';
import type { OperationResult, ProgressCallback, SplitOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { parseSplitGroups } from './pageRangeParser';
import { createZip } from './zip';
import { verifyPdf } from './verifyPdf';

/**
 * Splits a PDF document using QPDF WebAssembly.
 * Preserves exact page dimensions, rotations, vectors, fonts, and annotations.
 */
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

  onProgress?.(10, 'Reading PDF document for splitting...');
  const fileBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(fileBuffer);
  const totalPages = await QpdfEngine.getPageCount(rawBytes);
  const baseName = getBaseFileName(file.name);

  if (totalPages === 0) {
    throw new Error('This PDF contains no pages.');
  }

  const generatedParts: { name: string; bytes: Uint8Array; pageCount: number }[] = [];

  if (options.mode === 'every-page') {
    onProgress?.(30, `Splitting document into ${totalPages} single-page documents...`);
    const parts = await QpdfEngine.splitPdf(rawBytes, { pagesPerFile: 1 });

    for (let p = 0; p < parts.length; p++) {
      generatedParts.push({
        name: `${baseName}-page-${p + 1}.pdf`,
        bytes: parts[p],
        pageCount: 1,
      });
    }
  } else if (options.mode === 'every-n-pages') {
    const n = Math.max(1, options.everyN || 1);
    onProgress?.(30, `Splitting document every ${n} page(s)...`);
    const parts = await QpdfEngine.splitPdf(rawBytes, { pagesPerFile: n });

    let start = 1;
    for (let i = 0; i < parts.length; i++) {
      const end = Math.min(start + n - 1, totalPages);
      const count = end - start + 1;
      generatedParts.push({
        name: `${baseName}-pages-${start}-${end}.pdf`,
        bytes: parts[i],
        pageCount: count,
      });
      start = end + 1;
    }
  } else if (options.mode === 'ranges') {
    const groupRes = parseSplitGroups(options.ranges || '1', totalPages);
    if (groupRes.error || groupRes.groups.length === 0) {
      throw new Error(groupRes.error || 'Invalid range definition.');
    }

    const totalGroups = groupRes.groups.length;
    for (let idx = 0; idx < totalGroups; idx++) {
      if (signal?.aborted) {
        throw new Error('Operation cancelled.');
      }

      const group = groupRes.groups[idx];
      const percent = Math.round(20 + (idx / totalGroups) * 60);
      onProgress?.(percent, `Extracting split group ${idx + 1} of ${totalGroups}...`);

      const partBytes = await QpdfEngine.extractPages(rawBytes, { pages: group });
      const label = group.length === 1 ? `page-${group[0]}` : `part-${idx + 1}`;

      generatedParts.push({
        name: `${baseName}-${label}.pdf`,
        bytes: partBytes,
        pageCount: group.length,
      });
    }
  }

  if (generatedParts.length === 0) {
    throw new Error('No pages were selected to split.');
  }

  // Verify all generated PDF parts
  onProgress?.(85, 'Verifying split PDF outputs...');
  for (const part of generatedParts) {
    const verification = await verifyPdf(part.bytes, part.pageCount);
    if (!verification.isValid) {
      throw new Error(
        `The PDF could not be safely processed: ${verification.errors.join(', ')}. Your original file has not been changed.`
      );
    }
  }

  // If only 1 part exists, return direct PDF
  if (generatedParts.length === 1) {
    const single = generatedParts[0];
    const blob = new Blob([single.bytes as BlobPart], { type: 'application/pdf' });
    onProgress?.(100, 'Split completed successfully!');

    return {
      blob,
      fileName: single.name,
      fileSize: blob.size,
      originalSize: file.size,
      pageCount: single.pageCount,
      isZip: false,
    };
  }

  // Multiple outputs -> package into ZIP archive in browser
  onProgress?.(92, 'Archiving split PDFs into ZIP...');
  const zipData = createZip(generatedParts.map(p => ({ name: p.name, data: p.bytes })));
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
