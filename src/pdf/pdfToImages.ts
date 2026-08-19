import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { OperationResult, ProgressCallback, PdfToImageOptions } from './types';
import { getBaseFileName } from './downloadUtils';
import { parsePageRanges } from './pageRangeParser';
import { createZip } from './zip';
import { PDFJS_CMAP_URL, PDFJS_CMAP_PACKED } from './pdfjsConfig';

/**
 * Converts PDF pages into JPEG or PNG images using PDF.js rendering and memory-safe Blobs.
 * Avoids large base64 conversions.
 */
export async function convertPdfToImages(
  file: File,
  options: PdfToImageOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(5, 'Loading PDF for image conversion...');
  const fileBuffer = await file.arrayBuffer();

  const pdfjsDoc = await pdfjsLib.getDocument({
    data: new Uint8Array(fileBuffer),
    cMapUrl: PDFJS_CMAP_URL,
    cMapPacked: PDFJS_CMAP_PACKED,
  }).promise;

  const totalPages = pdfjsDoc.numPages;
  const baseName = getBaseFileName(file.name);

  let targetPages: number[] = [];
  if (options.pagesMode === 'all') {
    targetPages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const parseRes = parsePageRanges(options.customRanges || '1', totalPages, { deduplicate: true, sort: true });
    if (parseRes.error || parseRes.pages.length === 0) {
      throw new Error(parseRes.error || 'Please specify valid pages to convert.');
    }
    targetPages = parseRes.pages;
  }

  const scale = (options.dpi || 150) / 72;
  const mimeType = options.format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = options.format === 'png' ? 'png' : 'jpg';

  const imageFiles: { name: string; data: Uint8Array }[] = [];
  const totalTarget = targetPages.length;

  for (let i = 0; i < totalTarget; i++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const pageNum = targetPages[i];
    const percent = Math.round(10 + (i / totalTarget) * 80);
    onProgress?.(percent, `Rendering page ${pageNum} (${i + 1}/${totalTarget}) at ${options.dpi || 150} DPI...`);

    const pdfPage = await pdfjsDoc.getPage(pageNum);
    const viewport = pdfPage.getViewport({ scale });

    if (typeof document !== 'undefined' && document.createElement) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');

      if (options.format === 'jpg' && ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      await pdfPage.render({
        canvasContext: ctx!,
        viewport,
        canvas,
        intent: 'print',
      }).promise;

      // Memory-safe canvas.toBlob avoiding base64 string allocations
      const imgBlob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(resolve, mimeType, options.quality || 0.92);
      });

      if (!imgBlob) {
        throw new Error(`Failed to render page ${pageNum} to image.`);
      }

      const imgBuffer = await imgBlob.arrayBuffer();
      imageFiles.push({
        name: `${baseName}-page-${pageNum}.${ext}`,
        data: new Uint8Array(imgBuffer),
      });

      // Free canvas memory immediately
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  // If single page, return as direct image download
  if (imageFiles.length === 1) {
    const single = imageFiles[0];
    const blob = new Blob([single.data as BlobPart], { type: mimeType });
    onProgress?.(100, 'Image generated successfully!');

    return {
      blob,
      fileName: single.name,
      fileSize: blob.size,
      originalSize: file.size,
      pageCount: 1,
      isZip: false,
    };
  }

  // Multiple pages -> package into ZIP archive
  onProgress?.(92, 'Packaging images into ZIP archive...');
  const zipData = createZip(imageFiles);
  const zipBlob = new Blob([zipData as BlobPart], { type: 'application/zip' });

  onProgress?.(100, 'Images converted successfully!');

  return {
    blob: zipBlob,
    fileName: `${baseName}-${ext}-images.zip`,
    fileSize: zipBlob.size,
    originalSize: file.size,
    pageCount: targetPages.length,
    isZip: true,
  };
}
