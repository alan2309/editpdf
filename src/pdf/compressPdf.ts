import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createPdfToolkit, type PdfToolkit } from 'pdfstudio';
import type { OperationResult, ProgressCallback, CompressOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { PDFJS_CMAP_URL, PDFJS_CMAP_PACKED } from './pdfConfig';
import { verifyPdf } from './verifyPdf';

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
 * Production PDF compression pipeline with three distinct modes:
 * - SAFE: Lossless structural & stream optimization (100% text/vector/font preservation).
 * - BALANCED: Structural stream rebuilding & object optimization with zero rasterization.
 * - MAXIMUM: Explicit sequential raster downsampling with exact dimension & rotation preservation.
 *
 * Enforces output size safeguard: if output >= original, retains original PDF with truthful 0% savings.
 */
export async function compressPdf(
  file: File,
  options: CompressOptions,
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
  const rawBytes = new Uint8Array(fileBuffer);
  const originalSize = file.size;

  // Load document to get authoritative page count
  const srcDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  let compressedBytes: Uint8Array;

  // ==========================================
  // MODE 1: SAFE (Lossless Stream Optimization)
  // ==========================================
  if (options.mode === 'safe') {
    onProgress?.(25, 'Applying lossless structural & stream compression...');
    try {
      const toolkit = await getPdfToolkit();
      // Lossless compression with QPDF WebAssembly
      compressedBytes = await toolkit.compress(rawBytes);
    } catch {
      // Fallback to pdf-lib object stream optimization
      compressedBytes = await srcDoc.save({ useObjectStreams: true });
    }
  }
  // ==========================================
  // MODE 2: BALANCED (Advanced Stream & Object Optimization)
  // ==========================================
  else if (options.mode === 'balanced') {
    onProgress?.(20, 'Analyzing PDF streams & removing unreferenced objects...');

    // Reconstruct clean document to eliminate orphaned streams & unreferenced metadata
    const cleanDoc = await PDFDocument.create();
    const copiedPages = await cleanDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach(p => cleanDoc.addPage(p));

    onProgress?.(60, 'Re-encoding cross-reference tables & object streams...');
    const reorderedBytes = await cleanDoc.save({ useObjectStreams: true });

    try {
      const toolkit = await getPdfToolkit();
      compressedBytes = await toolkit.compress(reorderedBytes);
    } catch {
      compressedBytes = reorderedBytes;
    }
  }
  // ==========================================
  // MODE 3: MAXIMUM (Explicit Raster Downsampling)
  // ==========================================
  else {
    onProgress?.(15, 'Preparing maximum compression (raster downsampling)...');

    const dpi = options.targetDpi || 100;
    const scale = dpi / 72; // Strict DPI to scale calculation
    const quality = options.quality || 0.6;

    const pdfjsDoc = await pdfjsLib.getDocument({
      data: rawBytes.slice(),
      cMapUrl: PDFJS_CMAP_URL,
      cMapPacked: PDFJS_CMAP_PACKED,
    }).promise;

    const outDoc = await PDFDocument.create();

    for (let p = 1; p <= totalPages; p++) {
      if (signal?.aborted) {
        throw new Error('Operation cancelled.');
      }

      const percent = Math.round(15 + (p / totalPages) * 75);
      onProgress?.(percent, `Processing page ${p} of ${totalPages} at ${dpi} DPI...`);

      const pdfPage = await pdfjsDoc.getPage(p);
      const viewport = pdfPage.getViewport({ scale });
      const originalViewport = pdfPage.getViewport({ scale: 1.0 });

      // In browser environment with DOM canvas
      if (typeof document !== 'undefined' && document.createElement) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d', { alpha: false });

        if (ctx) {
          // Explicit white background to prevent transparency black-box corruption
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await pdfPage.render({
          canvasContext: ctx!,
          viewport,
          canvas,
          intent: 'print',
        }).promise;

        // Memory-safe canvas.toBlob avoiding giant base64 strings
        const imgBlob = await new Promise<Blob | null>(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', quality);
        });

        if (!imgBlob) {
          throw new Error(`Failed to encode image for page ${p}.`);
        }

        const imgBuffer = await imgBlob.arrayBuffer();
        const embeddedImg = await outDoc.embedJpg(imgBuffer);

        // Canvas memory cleanup immediately
        canvas.width = 0;
        canvas.height = 0;

        // Preserve exact original unscaled page dimensions
        const newPage = outDoc.addPage([originalViewport.width, originalViewport.height]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: originalViewport.width,
          height: originalViewport.height,
        });

        // Preserve original page rotation
        if (pdfPage.rotate) {
          newPage.setRotation(degrees(pdfPage.rotate));
        }
      } else {
        // Non-DOM environment fallback (e.g. Node tests)
        const copied = await outDoc.copyPages(srcDoc, [p - 1]);
        outDoc.addPage(copied[0]);
      }
    }

    onProgress?.(92, 'Finalizing maximum compression...');
    compressedBytes = await outDoc.save({ useObjectStreams: true });
  }

  // ==========================================
  // OUTPUT VERIFICATION & SIZE COMPARISON SAFEGUARD
  // ==========================================
  onProgress?.(96, 'Verifying generated PDF integrity...');

  const verification = await verifyPdf(compressedBytes, totalPages);
  let finalBytes = compressedBytes;

  // If verification failed, fallback safely to original
  if (!verification.isValid) {
    finalBytes = rawBytes;
  }

  const isSmaller = finalBytes.length < originalSize;
  const isOriginalRetained = !isSmaller;

  if (isOriginalRetained) {
    finalBytes = rawBytes; // Guarantee exact original bytes if output was not smaller
  }

  const fileSize = finalBytes.length;
  const savingsPercent = isSmaller
    ? Math.round(((originalSize - fileSize) / originalSize) * 100)
    : 0;

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-compressed.pdf`;
  const blob = new Blob([finalBytes as BlobPart], { type: 'application/pdf' });

  if (isSmaller) {
    onProgress?.(100, `Successfully compressed by ${savingsPercent}%!`);
  } else {
    onProgress?.(100, 'Original retained (no smaller file produced without quality loss).');
  }

  return {
    blob,
    fileName,
    fileSize,
    originalSize,
    pageCount: totalPages,
    isZip: false,
    isCompressed: isSmaller,
    isOriginalRetained,
    compressionSavingsPercent: savingsPercent,
  };
}
