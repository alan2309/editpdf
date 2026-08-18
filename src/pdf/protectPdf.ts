import { createPdfToolkit, type PdfToolkit } from 'pdfstudio';
import type { OperationResult, ProgressCallback, ProtectOptions } from './types';
import { getBaseFileName } from './downloadUtils';

let toolkitPromise: Promise<PdfToolkit> | null = null;

async function getPdfToolkit(): Promise<PdfToolkit> {
  if (!toolkitPromise) {
    toolkitPromise = createPdfToolkit(
      typeof window !== 'undefined' ? { wasmUrl: '/qpdf.wasm' } : undefined
    );
  }
  return toolkitPromise;
}

/**
 * Protects a PDF with standard AES-256 PDF encryption and granular security permissions
 * powered by QPDF compiled to WebAssembly.
 * Runs 100% locally in the browser with zero server uploads.
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

  onProgress?.(15, 'Initializing local WebAssembly encryption engine...');
  const toolkit = await getPdfToolkit();

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(35, 'Reading PDF document...');
  const fileBuffer = await file.arrayBuffer();
  const inputBytes = new Uint8Array(fileBuffer);

  const totalPages = await toolkit.pageCount(inputBytes);

  onProgress?.(60, 'Applying AES-256 standard encryption & security restrictions...');

  const printPerm = options.permissions?.printing ? 'full' : 'none';
  const modifyPerm = options.permissions?.modifying ? 'all' : 'none';
  const extractPerm = options.permissions?.copying !== false;

  const lockedBytes = await toolkit.lock(inputBytes, {
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

  onProgress?.(95, 'Finalizing password protected PDF...');
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
