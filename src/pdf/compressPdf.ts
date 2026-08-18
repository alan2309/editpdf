import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { OperationResult, ProgressCallback, CompressOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { PDFJS_CMAP_URL, PDFJS_CMAP_PACKED } from './pdfConfig';

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

  onProgress?.(5, 'Loading PDF for optimization...');
  const fileBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(fileBuffer);

  // 1. Structural stream optimization (preserves 100% vector text, links, and structure)
  const srcDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  onProgress?.(20, 'Optimizing internal cross-reference streams and metadata...');
  const structuralOptimizedBytes = await srcDoc.save({
    useObjectStreams: true,
  });

  // Basic Mode: Pure structural optimization
  if (options.level === 'high-quality') { // 'high-quality' maps to Basic non-destructive
    const chosenBytes = structuralOptimizedBytes.length < rawBytes.length ? structuralOptimizedBytes : rawBytes;
    const baseName = getBaseFileName(file.name);
    const fileName = `${baseName}-compressed.pdf`;
    const blob = new Blob([chosenBytes as BlobPart], { type: 'application/pdf' });

    onProgress?.(100, 'Basic structural optimization complete!');
    return {
      blob,
      fileName,
      fileSize: blob.size,
      originalSize: file.size,
      pageCount: totalPages,
      isZip: false,
    };
  }

  // Balanced Mode: Structural stream compression + cleaning unreferenced objects
  if (options.level === 'balanced') {
    onProgress?.(40, 'Performing balanced stream optimization...');
    // We rebuild the document to remove orphaned / deleted objects and optimize streams
    const cleanDoc = await PDFDocument.create();
    const copiedPages = await cleanDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach(p => cleanDoc.addPage(p));

    const balancedBytes = await cleanDoc.save({ useObjectStreams: true });
    let chosenBytes = balancedBytes.length < structuralOptimizedBytes.length ? balancedBytes : structuralOptimizedBytes;
    if (chosenBytes.length > rawBytes.length) {
      chosenBytes = rawBytes; // Smaller output safeguard
    }

    const baseName = getBaseFileName(file.name);
    const fileName = `${baseName}-compressed.pdf`;
    const blob = new Blob([chosenBytes as BlobPart], { type: 'application/pdf' });

    onProgress?.(100, 'Balanced optimization complete!');
    return {
      blob,
      fileName,
      fileSize: blob.size,
      originalSize: file.size,
      pageCount: totalPages,
      isZip: false,
    };
  }

  // Maximum Mode: Explicit raster-based downsampling at chosen DPI
  onProgress?.(25, 'Applying maximum compression (raster downsampling)...');
  const pdfjsDoc = await pdfjsLib.getDocument({
    data: rawBytes.slice(),
    cMapUrl: PDFJS_CMAP_URL,
    cMapPacked: PDFJS_CMAP_PACKED,
  }).promise;

  const outDoc = await PDFDocument.create();
  const dpi = options.targetDpi || 100;
  const scale = dpi / 72;
  const quality = options.quality || 0.65;

  for (let p = 1; p <= totalPages; p++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const percent = Math.round(25 + (p / totalPages) * 65);
    onProgress?.(percent, `Optimizing page ${p} of ${totalPages} at ${dpi} DPI...`);

    const pdfPage = await pdfjsDoc.getPage(p);
    const viewport = pdfPage.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d', { alpha: false });

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await pdfPage.render({
      canvasContext: ctx!,
      viewport,
      canvas,
      intent: 'print',
    }).promise;

    const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
    const imgBytes = await fetch(imgDataUrl).then(r => r.arrayBuffer());
    const embeddedImg = await outDoc.embedJpg(imgBytes);

    const originalViewport = pdfPage.getViewport({ scale: 1.0 });
    const newPage = outDoc.addPage([originalViewport.width, originalViewport.height]);
    newPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: originalViewport.width,
      height: originalViewport.height,
    });

    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.(92, 'Finalizing maximum compression...');
  const rasterBytes = await outDoc.save({ useObjectStreams: true });

  // Safeguard: Compare with structural compression and original
  let chosenBytes = rasterBytes;
  if (rasterBytes.length > structuralOptimizedBytes.length && structuralOptimizedBytes.length < rawBytes.length) {
    chosenBytes = structuralOptimizedBytes;
  } else if (rasterBytes.length > rawBytes.length && structuralOptimizedBytes.length >= rawBytes.length) {
    chosenBytes = rawBytes;
  }

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-compressed.pdf`;
  const blob = new Blob([chosenBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Maximum compression complete!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
