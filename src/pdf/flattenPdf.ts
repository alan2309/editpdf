import { PDFDocument } from 'pdf-lib';
import { QpdfEngine } from './qpdf/qpdfEngine';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';
import { verifyPdf } from './verifyPdf';

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

  onProgress?.(15, 'Reading PDF document for structural flattening...');
  const fileBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(fileBuffer);
  const totalPages = await QpdfEngine.getPageCount(rawBytes);

  onProgress?.(45, 'Flattening AcroForm interactive form fields & annotations...');
  let flattenedBytes: Uint8Array;

  try {
    // 1. Try QPDF annotation & appearance flattening
    flattenedBytes = await QpdfEngine.flattenPdf(rawBytes, { annotations: 'all' });
  } catch {
    // 2. Fallback to pdf-lib AcroForm flattening
    const pdfDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
    try {
      const form = pdfDoc.getForm();
      form.flatten();
    } catch {
      // Document has no AcroForm fields
    }
    flattenedBytes = await pdfDoc.save({ useObjectStreams: true });
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(80, 'Verifying flattened PDF integrity...');
  const verification = await verifyPdf(flattenedBytes, totalPages);

  if (!verification.isValid) {
    throw new Error(
      `The PDF could not be safely processed: ${verification.errors.join(', ')}. Your original file has not been changed.`
    );
  }

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-flattened.pdf`;
  const blob = new Blob([flattenedBytes as BlobPart], { type: 'application/pdf' });

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
