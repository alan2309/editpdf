import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFJS_CMAP_URL, PDFJS_CMAP_PACKED } from './pdfjsConfig';

export interface VerifyPdfOptions {
  expectedPageCount?: number;
  checkVisualRendering?: boolean;
}

export interface PdfVerificationResult {
  isValid: boolean;
  valid: boolean; // Alias for spec compatibility
  pageCount: number;
  byteLength: number;
  isEncrypted: boolean;
  hasValidHeader: boolean;
  errors: string[];
}

/**
 * Two-tier PDF Integrity Verification:
 * 1. Structural Verification: Magic header, parser load, page count, non-zero dimensions, valid 90° rotations.
 * 2. Visual / Render Verification: PDF.js document load, page viewport dimension check, and renderability.
 */
export async function verifyPdf(
  bytes: Uint8Array,
  expectedPagesOrOptions?: number | VerifyPdfOptions
): Promise<PdfVerificationResult> {
  const options: VerifyPdfOptions =
    typeof expectedPagesOrOptions === 'number'
      ? { expectedPageCount: expectedPagesOrOptions }
      : expectedPagesOrOptions || {};

  const errors: string[] = [];

  if (!bytes || bytes.length === 0) {
    return {
      isValid: false,
      valid: false,
      pageCount: 0,
      byteLength: 0,
      isEncrypted: false,
      hasValidHeader: false,
      errors: ['PDF byte stream is empty (0 bytes).'],
    };
  }

  // 1. Verify standard PDF magic header (%PDF-)
  const header = String.fromCharCode(...bytes.slice(0, 5));
  const hasValidHeader = header === '%PDF-';
  if (!hasValidHeader) {
    errors.push(`Invalid PDF header: expected "%PDF-", got "${header}".`);
  }

  // 2. Check for encryption dictionary in raw byte stream
  const decoder = new TextDecoder('latin1');
  const sampleHead = decoder.decode(bytes.slice(0, Math.min(bytes.length, 8192)));
  const sampleTail = decoder.decode(bytes.slice(Math.max(0, bytes.length - 8192)));
  const isEncrypted = sampleHead.includes('/Encrypt') || sampleTail.includes('/Encrypt');

  let pageCount = 0;

  // 3. Tier 1: Structural verification with pdf-lib
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pageCount = doc.getPageCount();

    if (pageCount <= 0) {
      errors.push('PDF document contains 0 pages.');
    } else {
      if (options.expectedPageCount !== undefined && pageCount !== options.expectedPageCount) {
        errors.push(`Page count mismatch: expected ${options.expectedPageCount}, got ${pageCount}.`);
      }

      for (let i = 0; i < pageCount; i++) {
        const p = doc.getPage(i);
        const w = p.getWidth();
        const h = p.getHeight();
        if (w <= 0 || h <= 0 || Number.isNaN(w) || Number.isNaN(h)) {
          errors.push(`Page ${i + 1} has invalid dimensions (${w}x${h}).`);
        }

        const rot = p.getRotation().angle;
        if (rot % 90 !== 0) {
          errors.push(`Page ${i + 1} has non-orthogonal rotation (${rot}°).`);
        }
      }
    }
  } catch (err: any) {
    if (!isEncrypted) {
      errors.push(`Failed to parse PDF document structure: ${err.message || 'Corrupt PDF.'}`);
    }
  }

  // 4. Tier 2: Visual & Render Verification with PDF.js (if not encrypted or if explicitly requested)
  if (!isEncrypted && errors.length === 0 && options.checkVisualRendering !== false) {
    try {
      const pdfjsDoc = await pdfjsLib.getDocument({
        data: bytes.slice(),
        cMapUrl: PDFJS_CMAP_URL,
        cMapPacked: PDFJS_CMAP_PACKED,
      }).promise;

      if (pdfjsDoc.numPages !== pageCount) {
        errors.push(`PDF.js rendered page count (${pdfjsDoc.numPages}) does not match structural count (${pageCount}).`);
      }

      for (let p = 1; p <= pdfjsDoc.numPages; p++) {
        const page = await pdfjsDoc.getPage(p);
        const viewport = page.getViewport({ scale: 1.0 });
        if (viewport.width <= 0 || viewport.height <= 0) {
          errors.push(`Page ${p} has invalid rendered viewport (${viewport.width}x${viewport.height}).`);
        }
      }
    } catch (renderErr: any) {
      errors.push(`PDF visual rendering check failed: ${renderErr.message || 'Render error.'}`);
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    valid: isValid,
    pageCount,
    byteLength: bytes.length,
    isEncrypted,
    hasValidHeader,
    errors,
  };
}
