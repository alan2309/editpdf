export interface PDFFileInfo {
  id: string;
  file: File;
  name: string;
  size: number;
  totalPages?: number;
  bytes?: Uint8Array;
}

export type ProgressCallback = (progress: number, statusMessage?: string) => void;

export interface OperationResult {
  blob: Blob;
  fileName: string;
  fileSize: number;
  originalSize?: number;
  pageCount?: number;
  isZip?: boolean;
  isCompressed?: boolean;
  isOriginalRetained?: boolean;
  compressionSavingsPercent?: number;
}

export interface SplitOptions {
  mode: 'every-page' | 'ranges' | 'every-n-pages';
  ranges?: string; // e.g. "1-5, 6-10, 11-20"
  everyN?: number; // e.g. 5
}

export interface RotateOptions {
  rotation: 90 | 180 | 270;
  pagesMode: 'all' | 'custom';
  customRanges?: string;
}

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number; // 0.1 to 1.0
  rotation: number; // e.g. 45
  position: 'center' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  color: string; // hex string e.g. '#dc2626'
  pagesMode: 'all' | 'custom';
  customRanges?: string;
}

export interface PageNumberOptions {
  format: 'page-n' | 'page-n-of-total' | 'n' | 'n-of-total';
  position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
  startNumber: number;
  fontSize: number;
  color: string;
  margin: number;
  pagesMode: 'all' | 'custom';
  customRanges?: string;
}

export interface ImageToPdfOptions {
  pageSize: 'a4' | 'letter' | 'original' | 'fit-page';
  orientation: 'portrait' | 'landscape' | 'auto';
  fit: 'contain' | 'cover' | 'original';
  margin: number;
  backgroundColor: string;
}

export interface PdfToImageOptions {
  format: 'jpg' | 'png';
  quality: number; // 0.1 to 1.0 for JPG
  dpi: 72 | 150 | 300;
  pagesMode: 'all' | 'custom';
  customRanges?: string;
}

export interface CompressOptions {
  mode: 'safe' | 'balanced' | 'maximum';
  targetDpi?: 72 | 100 | 150 | 200;
  quality?: number; // 0.1 to 1.0 for raster JPEG
}

export interface ProtectOptions {
  password: string;
  permissions?: {
    printing?: boolean;
    copying?: boolean;
    modifying?: boolean;
  };
}
