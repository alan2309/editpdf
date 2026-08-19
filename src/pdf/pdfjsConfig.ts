/**
 * Centralized configuration for PDF.js runtime and local assets.
 * All PDF.js consumers MUST use these local constants.
 * Zero remote CDN dependencies.
 */

export const PDFJS_CMAP_URL = '/cmaps/';
export const PDFJS_CMAP_PACKED = true;
export const PDFJS_WORKER_URL = '/pdf.worker.min.mjs';

export const PDF_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
export const IMAGE_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const DEFAULT_RENDER_SCALE = 1.5;
export const DEFAULT_PRINT_DPI = 150;
