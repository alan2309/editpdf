import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { OperationResult, ProgressCallback, CompressOptions } from './types';
import { getBaseFileName } from './downloadUtils';

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

  // 1. First attempt structural stream compression with pdf-lib
  const srcDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  onProgress?.(15, 'Inspecting document streams...');
  const standardOptimizedBytes = await srcDoc.save({
    useObjectStreams: true,
  });

  // If balanced or maximum compression is chosen, downsample rendered raster pages
  if (options.level === 'maximum' || options.level === 'balanced') {
    onProgress?.(25, 'Optimizing page resolutions and raster image layers...');

    const pdfjsDoc = await pdfjsLib.getDocument({
      data: rawBytes.slice(),
      cMapUrl: '/cmaps/',
      cMapPacked: true,
    }).promise;

    const outDoc = await PDFDocument.create();
    const dpi = options.targetDpi || (options.level === 'maximum' ? 100 : 150);
    const scale = dpi / 72;
    const quality = options.quality || (options.level === 'maximum' ? 0.65 : 0.78);

    for (let p = 1; p <= totalPages; p++) {
      if (signal?.aborted) {
        throw new Error('Operation cancelled.');
      }

      const percent = Math.round(25 + (p / totalPages) * 65);
      onProgress?.(percent, `Optimizing page ${p} of ${totalPages}...`);

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

      // Add page with original PDF unscaled point dimensions
      const originalViewport = pdfPage.getViewport({ scale: 1.0 });
      const newPage = outDoc.addPage([originalViewport.width, originalViewport.height]);
      newPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: originalViewport.width,
        height: originalViewport.height,
      });

      // Canvas cleanup
      canvas.width = 0;
      canvas.height = 0;
    }

    onProgress?.(92, 'Finalizing optimized PDF...');
    const rasterCompressedBytes = await outDoc.save({ useObjectStreams: true });

    // Pick the smaller output between raster compressed and structural stream compression
    const chosenBytes = (rasterCompressedBytes.length < file.size) ? rasterCompressedBytes : (standardOptimizedBytes.length < file.size ? standardOptimizedBytes : rawBytes);

    const baseName = getBaseFileName(file.name);
    const fileName = `${baseName}-compressed.pdf`;
    const blob = new Blob([chosenBytes as BlobPart], { type: 'application/pdf' });

    onProgress?.(100, 'Compression completed successfully!');

    return {
      blob,
      fileName,
      fileSize: blob.size,
      originalSize: file.size,
      pageCount: totalPages,
      isZip: false,
    };
  }

  // High quality / vector preservation mode
  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-compressed.pdf`;
  const chosenBytes = (standardOptimizedBytes.length < file.size) ? standardOptimizedBytes : rawBytes;
  const blob = new Blob([chosenBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Compression completed!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
