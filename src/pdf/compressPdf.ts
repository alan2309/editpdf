import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { QpdfEngine } from './qpdf/qpdfEngine';
import type { OperationResult, ProgressCallback, CompressOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { PDFJS_CMAP_URL, PDFJS_CMAP_PACKED } from './pdfjsConfig';
import { verifyPdf } from './verifyPdf';

/**
 * Production PDF compression pipeline with three distinct modes:
 * - SAFE: Lossless structural stream optimization with QPDF (100% text/vector/font preservation).
 * - BALANCED: Structural & object stream optimization with QPDF (100% text/vector/font preservation).
 * - MAXIMUM: Explicit raster downsampling with exact MediaBox/CropBox geometry and single rotation application.
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

  onProgress?.(5, 'Reading PDF document for compression...');
  const fileBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(fileBuffer);
  const originalSize = file.size;

  const totalPages = await QpdfEngine.getPageCount(rawBytes);

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  let compressedBytes: Uint8Array;

  // ==========================================
  // MODE 1: SAFE (Lossless Stream Optimization via QPDF)
  // ==========================================
  if (options.mode === 'safe') {
    onProgress?.(25, 'Applying lossless structural stream compression with QPDF...');
    try {
      compressedBytes = await QpdfEngine.compressPdf(rawBytes, {
        compressionLevel: 9,
        objectStreams: true,
      });
    } catch {
      // Fallback to pdf-lib object stream optimization if needed
      const srcDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
      compressedBytes = await srcDoc.save({ useObjectStreams: true });
    }
  }
  // ==========================================
  // MODE 2: BALANCED (Structural & Object Stream Optimization via QPDF)
  // ==========================================
  else if (options.mode === 'balanced') {
    onProgress?.(25, 'Applying structural and object stream optimization with QPDF...');
    try {
      compressedBytes = await QpdfEngine.compressPdf(rawBytes, {
        compressionLevel: 9,
        objectStreams: true,
      });
    } catch {
      const srcDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
      compressedBytes = await srcDoc.save({ useObjectStreams: true });
    }
  }
  // ==========================================
  // MODE 3: MAXIMUM (Explicit Raster Downsampling)
  // ==========================================
  else {
    onProgress?.(15, 'Preparing maximum compression (raster downsampling)...');

    const dpi = options.targetDpi || 100;
    const scale = dpi / 72;
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

      // 1. Get original unrotated logical dimensions
      const originalUnrotatedViewport = pdfPage.getViewport({ scale: 1.0, rotation: 0 });
      const logicalWidth = originalUnrotatedViewport.width;
      const logicalHeight = originalUnrotatedViewport.height;

      // 2. Render viewport at scale with rotation 0 so raster image is unrotated
      const renderViewport = pdfPage.getViewport({ scale, rotation: 0 });

      if (typeof document !== 'undefined' && document.createElement) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        const ctx = canvas.getContext('2d', { alpha: false });

        if (ctx) {
          // Explicit white background to prevent transparency black box artifacts
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await pdfPage.render({
          canvasContext: ctx!,
          viewport: renderViewport,
          canvas,
          intent: 'print',
        }).promise;

        const imgBlob = await new Promise<Blob | null>(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', quality);
        });

        if (!imgBlob) {
          throw new Error(`Failed to encode image for page ${p}.`);
        }

        const imgBuffer = await imgBlob.arrayBuffer();
        const embeddedImg = await outDoc.embedJpg(imgBuffer);

        // Immediate canvas memory cleanup
        canvas.width = 0;
        canvas.height = 0;

        // 3. Create output page with original logical dimensions
        const newPage = outDoc.addPage([logicalWidth, logicalHeight]);

        // 4. Draw image onto page using unrotated logical bounds
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: logicalWidth,
          height: logicalHeight,
        });

        // 5. Apply original page rotation exactly once
        if (pdfPage.rotate) {
          newPage.setRotation(degrees(pdfPage.rotate));
        }
      } else {
        // Fallback for non-DOM test environments
        const srcDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
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

  if (!verification.isValid) {
    finalBytes = rawBytes; // Safely retain original if invalid
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
