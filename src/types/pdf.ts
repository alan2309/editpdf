// Per-item text formatting
export interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontFamily: 'helvetica' | 'times' | 'courier';
  /** Size delta in canvas-px relative to original (+ larger, - smaller) */
  fontSizeDelta: number;
  /** CSS hex color string e.g. '#000000' */
  color: string;
  /** URL — empty string means no link */
  link: string;
}

export const DEFAULT_FORMAT: TextFormat = {
  bold: false,
  italic: false,
  underline: false,
  fontFamily: 'helvetica',
  fontSizeDelta: 0,
  color: '#000000',
  link: '',
};

export interface PDFTextItem {
  id: string;
  pageIndex: number;
  originalText: string;
  editedText: string;
  x: number;        // canvas-space x
  y: number;        // canvas-space y
  originalX: number; // canvas-space original x
  originalY: number; // canvas-space original y
  width: number;    // canvas-space width
  height: number;   // canvas-space height
  fontSize: number; // approximate font size in canvas px
  transform: number[]; // raw PDF transform matrix
  fontName: string;
  format: TextFormat;
  isDeleted?: boolean;
  isAdded?: boolean;
}

export interface PDFPageInfo {
  pageIndex: number;
  width: number;
  height: number;
}

export interface RedactionBox {
  id: string;
  pageIndex: number;
  x: number;        // canvas-space x
  y: number;        // canvas-space y
  width: number;    // canvas-space width
  height: number;   // canvas-space height
  type: 'blackout' | 'whiteout';
}

export interface PDFSignatureItem {
  id: string;
  pageIndex: number;
  dataUrl: string; // Base64 PNG image
  x: number;       // canvas-space x
  y: number;       // canvas-space y
  width: number;   // canvas-space width
  height: number;  // canvas-space height
}

export interface PDFStampItem {
  id: string;
  pageIndex: number;
  type: 'preset-stamp' | 'custom-image';
  dataUrl: string; // Base64 PNG image
  label?: string;  // e.g. "APPROVED", "PAID"
  x: number;       // canvas-space x
  y: number;       // canvas-space y
  width: number;   // canvas-space width
  height: number;  // canvas-space height
  rotation: number; // in degrees e.g. -15, 0, 15, 45
  opacity: number;  // 0.1 to 1.0
}

export type EditorTool = 'select' | 'text' | 'blackout' | 'whiteout';
export type ExportMode = 'sanitized' | 'vector';

export interface VerificationCheck {
  term: string;
  pageIndex: number;
  foundCount: number;
  status: 'purged' | 'detected';
}

export interface VerificationReport {
  timestamp: number;
  mode: ExportMode;
  totalChecked: number;
  passed: boolean;
  checks: VerificationCheck[];
  metadataStripped: boolean;
}

export interface PDFEditorState {
  fileName: string;
  totalPages: number;
  currentPage: number;
  scale: number;
  textItems: PDFTextItem[];
  pageItems: Record<number, PDFTextItem[]>;
  redactions: Record<number, RedactionBox[]>;
  signatures: Record<number, PDFSignatureItem[]>;
  stamps: Record<number, PDFStampItem[]>;
  activeItemId: string | null;
  activeRedactionId: string | null;
  activeSignatureId: string | null;
  activeStampId: string | null;
  activeTool: EditorTool;
  exportMode: ExportMode;
  sanitizeMetadata: boolean;
  verifyOnExport: boolean;
  verificationReport: VerificationReport | null;
  isVerifying: boolean;
  isDirty: boolean;
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
}



