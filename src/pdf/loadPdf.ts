import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure PDF.js worker is properly configured
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export interface LoadedPdfDoc {
  pdfDoc: PDFDocument;
  rawBytes: Uint8Array;
  totalPages: number;
}

export async function loadPdfDoc(fileOrBytes: File | Uint8Array | ArrayBuffer): Promise<LoadedPdfDoc> {
  let rawBytes: Uint8Array;

  if (fileOrBytes instanceof File) {
    const buffer = await fileOrBytes.arrayBuffer();
    rawBytes = new Uint8Array(buffer);
  } else if (fileOrBytes instanceof ArrayBuffer) {
    rawBytes = new Uint8Array(fileOrBytes);
  } else {
    rawBytes = fileOrBytes;
  }

  // Load in pdf-lib (ignore encryption errors if flagged)
  const pdfDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  return {
    pdfDoc,
    rawBytes,
    totalPages,
  };
}

export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  return pdfDoc.getPageCount();
}
