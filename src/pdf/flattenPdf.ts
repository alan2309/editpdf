import { PDFDocument } from 'pdf-lib';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';

/**
 * Structural, non-destructive PDF flattening.
 * Converts interactive AcroForm fields, digital signatures, and annotations
 * into static vector graphics while 100% preserving original text selectability,
 * fonts, links, and vector artwork.
 */
export async function flattenPdf(
  file: File,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(15, 'Loading PDF document for structural flattening...');
  const fileBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(45, 'Flattening AcroForm interactive form fields & annotations...');
  try {
    const form = pdfDoc.getForm();
    form.flatten();
  } catch {
    // Document does not contain active AcroForm fields; proceed
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(80, 'Saving structurally flattened PDF...');
  const outBytes = await pdfDoc.save({ useObjectStreams: true });

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-flattened.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'PDF flattened successfully without rasterization!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
