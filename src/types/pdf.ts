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

export interface PDFEditorState {
  fileName: string;
  totalPages: number;
  currentPage: number;
  scale: number;
  textItems: PDFTextItem[];
  activeItemId: string | null;
  isDirty: boolean;
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
}
