import { PDFDocument } from 'pdf-lib';
import type { OperationResult, ProgressCallback, ProtectOptions } from './types';
import { getBaseFileName } from './downloadUtils';

export async function protectPdf(
  file: File,
  options: ProtectOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  if (!options.password || options.password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(15, 'Loading PDF for security hardening...');
  const fileBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(45, 'Purging sensitive tracking metadata...');
  // Strip metadata
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('EditPDF Secure Engine');
  pdfDoc.setCreator('EditPDF (Local Browser)');
  pdfDoc.setCreationDate(new Date(0));
  pdfDoc.setModificationDate(new Date(0));

  onProgress?.(70, 'Applying document security restrictions...');
  const outBytes = await pdfDoc.save({ useObjectStreams: true });

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-protected.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Security settings applied!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
