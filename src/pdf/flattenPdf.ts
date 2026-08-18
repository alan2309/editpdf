import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { OperationResult, ProgressCallback } from './types';
import { getBaseFileName } from './downloadUtils';

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

  onProgress?.(10, 'Loading PDF for flattening...');
  const fileBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(30, 'Flattening form fields and interactive annotations...');
  try {
    const form = pdfDoc.getForm();
    form.flatten();
  } catch {
    // If document has no AcroForm fields, proceed
  }

  // Also render high-res vector/canvas flattening for complete security & non-interactive output
  onProgress?.(50, 'Rendering static visual layers...');
  const pdfjsDoc = await pdfjsLib.getDocument({
    data: new Uint8Array(fileBuffer),
    cMapUrl: '/cmaps/',
    cMapPacked: true,
  }).promise;

  const outDoc = await PDFDocument.create();
  const scale = 200 / 72; // 200 DPI crisp print resolution

  for (let p = 1; p <= totalPages; p++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const percent = Math.round(50 + (p / totalPages) * 40);
    onProgress?.(percent, `Flattening page ${p} of ${totalPages}...`);

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

    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
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

  onProgress?.(92, 'Saving flattened PDF...');
  const outBytes = await outDoc.save({ useObjectStreams: true });

  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-flattened.pdf`;
  const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'PDF flattened successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
