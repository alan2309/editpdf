import { QpdfEngine } from './qpdf/qpdfEngine';
import type { OperationResult, ProgressCallback, ProtectOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { verifyPdf } from './verifyPdf';

/**
 * Protects a PDF document with standard AES-256 encryption and granular security permissions
 * powered by QPDF WebAssembly.
 * Runs 100% locally in the browser with zero server uploads or external APIs.
 */
export async function protectPdf(
  file: File,
  options: ProtectOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  if (!options.password || options.password.length < 3) {
    throw new Error('Password must be at least 3 characters long.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(15, 'Reading PDF document for encryption...');
  const fileBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(fileBuffer);
  const totalPages = await QpdfEngine.getPageCount(rawBytes);

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(45, 'Applying standard AES-256 encryption & permission restrictions...');

  const printPerm = options.permissions?.printing ? 'full' : 'none';
  const modifyPerm = options.permissions?.modifying ? 'all' : 'none';
  const extractPerm = options.permissions?.copying !== false;

  const lockedBytes = await QpdfEngine.protectPdf(rawBytes, {
    userPassword: options.password,
    ownerPassword: options.password,
    keyLength: 256,
    permissions: {
      print: printPerm,
      modify: modifyPerm,
      extract: extractPerm,
    },
  });

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(85, 'Verifying encrypted PDF output...');
  const verification = await verifyPdf(lockedBytes, totalPages);

  if (!verification.isValid) {
    throw new Error(
      `The PDF could not be safely processed: ${verification.errors.join(', ')}. Your original file has not been changed.`
    );
  }

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-protected.pdf`;
  const blob = new Blob([lockedBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Password protection applied successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
