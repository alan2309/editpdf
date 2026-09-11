/**
 * Centralized configuration for PDF.js runtime and local assets.
 * All PDF.js consumers MUST use these local constants.
 * Zero remote CDN dependencies.
 */

export const PDFJS_CMAP_URL = '/cmaps/';
export const PDFJS_CMAP_PACKED = true;
// PDF.js only ships metrics for the Standard 14 fonts. Supplying its local font
// assets prevents browser fallbacks from changing glyph widths or shapes while
// rendering PDFs that reference Helvetica, Times, Courier, or Symbol.
export const PDFJS_STANDARD_FONT_DATA_URL = '/standard_fonts/';
export const PDFJS_WORKER_URL = '/pdf.worker.min.mjs';

export const PDFJS_DOCUMENT_OPTIONS = {
  cMapUrl: PDFJS_CMAP_URL,
  cMapPacked: PDFJS_CMAP_PACKED,
  standardFontDataUrl: PDFJS_STANDARD_FONT_DATA_URL,
} as const;

export const PDF_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
export const IMAGE_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const DEFAULT_RENDER_SCALE = 1.5;
export const DEFAULT_PRINT_DPI = 150;
