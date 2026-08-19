import { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type {
  PDFTextItem, TextFormat, PDFEditorState, RedactionBox, EditorTool,
  ExportMode, VerificationReport, VerificationCheck, PDFSignatureItem, PDFStampItem,
  SearchMatch
} from '../types/pdf';
import { DEFAULT_FORMAT } from '../types/pdf';
import { calculateSubstringBox } from '../utils/textMetrics';

import { PDFJS_WORKER_URL, PDFJS_CMAP_URL, PDFJS_CMAP_PACKED, PDF_MAX_FILE_SIZE } from '../pdf/pdfConfig';

// Worker served locally from /public to avoid CDN version mismatch
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

const DEFAULT_SCALE = 1.5;

// Helper: hex '#rrggbb' → {r,g,b} each 0-1
function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace('#', '');
  const n = parseInt(c, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

// Map format → pdf-lib StandardFont key
function resolveStdFont(fmt: TextFormat): StandardFonts {
  const { fontFamily, bold, italic } = fmt;
  if (fontFamily === 'times') {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold)           return StandardFonts.TimesRomanBold;
    if (italic)         return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (fontFamily === 'courier') {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold)           return StandardFonts.CourierBold;
    if (italic)         return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }
  // helvetica (default)
  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold)           return StandardFonts.HelveticaBold;
  if (italic)         return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

// Convert dataURL to Uint8Array for pdf-lib image embedding
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function usePDFEditor() {
  const [state, setState] = useState<PDFEditorState>({
    fileName: '',
    totalPages: 0,
    currentPage: 1,
    scale: DEFAULT_SCALE,
    pageDimensions: {},
    textItems: [],
    pageItems: {},
    redactions: {},
    signatures: {},
    stamps: {},
    activeItemId: null,
    activeRedactionId: null,
    activeSignatureId: null,
    activeStampId: null,
    activeTool: 'select',
    exportMode: 'sanitized',
    sanitizeMetadata: true,
    verifyOnExport: true,
    verificationReport: null,
    isVerifying: false,
    isDirty: false,
    isLoading: false,
    isExporting: false,
    error: null,
  });

  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const rawBytesRef = useRef<ArrayBuffer | null>(null);
  const renderTasksRef = useRef<Map<number, pdfjsLib.RenderTask>>(new Map());

  // Active text editing transaction tracking (to prevent keystrokes from flooding undo history)
  const editingPreValueRef = useRef<{ id: string; originalValue: string } | null>(null);

  // Undo / Redo Stacks
  const historyRef = useRef<{
    pageItems: Record<number, PDFTextItem[]>;
    redactions: Record<number, RedactionBox[]>;
    signatures: Record<number, PDFSignatureItem[]>;
    stamps: Record<number, PDFStampItem[]>;
  }[]>([]);

  const futureRef = useRef<{
    pageItems: Record<number, PDFTextItem[]>;
    redactions: Record<number, RedactionBox[]>;
    signatures: Record<number, PDFSignatureItem[]>;
    stamps: Record<number, PDFStampItem[]>;
  }[]>([]);

  // Push helper for history tracking
  const pushToHistory = useCallback((
    currentPages: Record<number, PDFTextItem[]>,
    currentRedactions: Record<number, RedactionBox[]>,
    currentSignatures: Record<number, PDFSignatureItem[]>,
    currentStamps: Record<number, PDFStampItem[]>
  ) => {
    const pagesClone: Record<number, PDFTextItem[]> = {};
    for (const [k, items] of Object.entries(currentPages)) {
      pagesClone[Number(k)] = items.map(item => ({ ...item, format: { ...item.format } }));
    }
    const redactionsClone: Record<number, RedactionBox[]> = {};
    for (const [k, boxes] of Object.entries(currentRedactions)) {
      redactionsClone[Number(k)] = boxes.map(b => ({ ...b }));
    }
    const signaturesClone: Record<number, PDFSignatureItem[]> = {};
    for (const [k, sigs] of Object.entries(currentSignatures)) {
      signaturesClone[Number(k)] = sigs.map(s => ({ ...s }));
    }
    const stampsClone: Record<number, PDFStampItem[]> = {};
    for (const [k, stList] of Object.entries(currentStamps)) {
      stampsClone[Number(k)] = stList.map(st => ({ ...st }));
    }
    historyRef.current.push({ pageItems: pagesClone, redactions: redactionsClone, signatures: signaturesClone, stamps: stampsClone });
    futureRef.current = []; // Clear redo stack
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const previous = historyRef.current.pop()!;
    setState(s => {
      const pagesClone: Record<number, PDFTextItem[]> = {};
      for (const [k, items] of Object.entries(s.pageItems)) {
        pagesClone[Number(k)] = items.map(item => ({ ...item, format: { ...item.format } }));
      }
      const redactionsClone: Record<number, RedactionBox[]> = {};
      for (const [k, boxes] of Object.entries(s.redactions)) {
        redactionsClone[Number(k)] = boxes.map(b => ({ ...b }));
      }
      const signaturesClone: Record<number, PDFSignatureItem[]> = {};
      for (const [k, sigs] of Object.entries(s.signatures)) {
        signaturesClone[Number(k)] = sigs.map(sig => ({ ...sig }));
      }
      const stampsClone: Record<number, PDFStampItem[]> = {};
      for (const [k, stList] of Object.entries(s.stamps)) {
        stampsClone[Number(k)] = stList.map(st => ({ ...st }));
      }
      futureRef.current.push({ pageItems: pagesClone, redactions: redactionsClone, signatures: signaturesClone, stamps: stampsClone });

      const currentPgItems = previous.pageItems[s.currentPage] || [];
      return {
        ...s,
        pageItems: previous.pageItems,
        redactions: previous.redactions,
        signatures: previous.signatures,
        stamps: previous.stamps,
        textItems: currentPgItems,
        isDirty: true,
      };
    });
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    setState(s => {
      const pagesClone: Record<number, PDFTextItem[]> = {};
      for (const [k, items] of Object.entries(s.pageItems)) {
        pagesClone[Number(k)] = items.map(item => ({ ...item, format: { ...item.format } }));
      }
      const redactionsClone: Record<number, RedactionBox[]> = {};
      for (const [k, boxes] of Object.entries(s.redactions)) {
        redactionsClone[Number(k)] = boxes.map(b => ({ ...b }));
      }
      const signaturesClone: Record<number, PDFSignatureItem[]> = {};
      for (const [k, sigs] of Object.entries(s.signatures)) {
        signaturesClone[Number(k)] = sigs.map(sig => ({ ...sig }));
      }
      const stampsClone: Record<number, PDFStampItem[]> = {};
      for (const [k, stList] of Object.entries(s.stamps)) {
        stampsClone[Number(k)] = stList.map(st => ({ ...st }));
      }
      historyRef.current.push({ pageItems: pagesClone, redactions: redactionsClone, signatures: signaturesClone, stamps: stampsClone });

      const currentPgItems = next.pageItems[s.currentPage] || [];
      return {
        ...s,
        pageItems: next.pageItems,
        redactions: next.redactions,
        signatures: next.signatures,
        stamps: next.stamps,
        textItems: currentPgItems,
        isDirty: true,
      };
    });
  }, []);

  // ── Load PDF ──────────────────────────────────────────────────────────────
  const loadPDF = useCallback(async (file: File) => {
    // Clean up previous resources
    renderTasksRef.current.forEach(t => { try { t.cancel(); } catch {} });
    renderTasksRef.current.clear();
    if (pdfDocRef.current) {
      try {
        pdfDocRef.current.cleanup();
        (pdfDocRef.current as { destroy?: () => void }).destroy?.();
      } catch { /* ignore */ }
      pdfDocRef.current = null;
    }
    rawBytesRef.current = null;

    setState(s => ({
      ...s,
      isLoading: true,
      error: null,
      textItems: [],
      pageItems: {},
      redactions: {},
      signatures: {},
      stamps: {},
      activeItemId: null,
      activeRedactionId: null,
      activeSignatureId: null,
      activeStampId: null,
      activeTool: 'select',
      verificationReport: null,
    }));
    historyRef.current = [];
    futureRef.current = [];
    editingPreValueRef.current = null;

    try {
      if (!file || file.size === 0) {
        throw new Error('The selected file is empty. Please select a valid PDF.');
      }

      if (file.size > PDF_MAX_FILE_SIZE) {
        throw new Error('File size exceeds the 100 MB limit. Please select a smaller PDF.');
      }

      const buffer = await file.arrayBuffer();
      // Check for basic PDF header '%PDF-'
      const headerBytes = new Uint8Array(buffer.slice(0, 5));
      const headerStr = String.fromCharCode(...headerBytes);
      if (headerStr !== '%PDF-') {
        throw new Error('Invalid file format. The uploaded file is not a valid PDF document.');
      }

      rawBytesRef.current = buffer.slice(0);

      const loadingTask = pdfjsLib.getDocument({
        data: buffer.slice(0),
        cMapUrl: PDFJS_CMAP_URL,
        cMapPacked: PDFJS_CMAP_PACKED,
      });

      const pdfDoc = await loadingTask.promise;
      pdfDocRef.current = pdfDoc;

      // Extract unscaled viewport dimensions for all pages rapidly
      const pageDimensions: Record<number, { width: number; height: number; rotation: number }> = {};
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        pageDimensions[i] = {
          width: vp.width,
          height: vp.height,
          rotation: page.rotate || 0,
        };
      }

      setState(s => ({
        ...s,
        fileName: file.name,
        totalPages: pdfDoc.numPages,
        currentPage: 1,
        pageDimensions,
        isDirty: false,
        isLoading: false,
      }));
    } catch (err: unknown) {
      console.error(err);
      let errMsg = 'Failed to load PDF. Make sure it is a valid PDF file.';
      if (err instanceof Error) {
        if (err.name === 'PasswordException') {
          errMsg = 'This PDF is password-protected. Please remove the password to edit.';
        } else if (err.message) {
          errMsg = err.message;
        }
      }
      setState(s => ({ ...s, isLoading: false, error: errMsg }));
    }
  }, []);

  // ── Standalone Page Text Extraction Helper ─────────────────────────────────
  const extractPageItems = useCallback(async (pageNum: number): Promise<PDFTextItem[]> => {
    if (state.pageItems[pageNum] && state.pageItems[pageNum].length > 0) {
      return state.pageItems[pageNum];
    }
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return [];

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: state.scale });
    const textContent = await page.getTextContent();
    const items: PDFTextItem[] = [];

    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue;

      const tx = item.transform as number[];
      const [, , , scaleY, x, y] = tx;
      const fontSize = Math.abs(scaleY);

      const pt = viewport.convertToViewportPoint(x, y);
      const ptEnd = viewport.convertToViewportPoint(x + item.width, y + fontSize);

      const cx = pt[0];
      const cy = Math.min(pt[1], ptEnd[1]);
      const cw = Math.abs(ptEnd[0] - pt[0]);
      const ch = Math.abs(ptEnd[1] - pt[1]) || fontSize * state.scale;

      items.push({
        id: `p${pageNum}-${items.length}`,
        pageIndex: pageNum - 1,
        originalText: item.str,
        editedText: item.str,
        x: cx,
        y: cy,
        originalX: cx,
        originalY: cy,
        width: Math.max(cw, 20),
        height: Math.max(ch, 10),
        fontSize: fontSize * state.scale,
        transform: tx,
        fontName: (item as { fontName?: string }).fontName ?? '',
        format: { ...DEFAULT_FORMAT },
      });
    }

    return items;
  }, [state.pageItems, state.scale]);

  // ── Cancel Render Task Helper ─────────────────────────────────────────────
  const cancelPageRender = useCallback((pageNum: number) => {
    const existing = renderTasksRef.current.get(pageNum);
    if (existing) {
      try { existing.cancel(); } catch { /* ignore */ }
      renderTasksRef.current.delete(pageNum);
    }
  }, []);

  // ── Render Page ───────────────────────────────────────────────────────────
  const renderPage = useCallback(async (
    canvas: HTMLCanvasElement,
    pageNum: number,
    scale: number
  ): Promise<PDFTextItem[]> => {
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return [];

    // Cancel any in-progress render task for this specific page
    const existingTask = renderTasksRef.current.get(pageNum);
    if (existingTask) {
      try { existingTask.cancel(); } catch { /* ignore */ }
      renderTasksRef.current.delete(pageNum);
    }

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    const task = page.render({ canvasContext: ctx, viewport, canvas });
    renderTasksRef.current.set(pageNum, task);

    try {
      await task.promise;
    } catch (err: unknown) {
      renderTasksRef.current.delete(pageNum);
      if (err instanceof Error && err.name === 'RenderingCancelledException') return [];
      throw err;
    }
    renderTasksRef.current.delete(pageNum);

    const items: PDFTextItem[] = [];

    // Extract fresh text items with coordinates
    const textContent = await page.getTextContent();
    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue;

      const tx = item.transform as number[];
      const [, , , scaleY, x, y] = tx;
      const fontSize = Math.abs(scaleY);

      const pt = viewport.convertToViewportPoint(x, y);
      const ptEnd = viewport.convertToViewportPoint(x + item.width, y + fontSize);

      const cx = pt[0];
      const cy = Math.min(pt[1], ptEnd[1]);
      const cw = Math.abs(ptEnd[0] - pt[0]);
      const ch = Math.abs(ptEnd[1] - pt[1]) || fontSize * scale;

      items.push({
        id: `p${pageNum}-${items.length}`,
        pageIndex: pageNum - 1,
        originalText: item.str,
        editedText: item.str,
        x: cx,
        y: cy,
        originalX: cx,
        originalY: cy,
        width: Math.max(cw, 20),
        height: Math.max(ch, 10),
        fontSize: fontSize * scale,
        transform: tx,
        fontName: (item as { fontName?: string }).fontName ?? '',
        format: { ...DEFAULT_FORMAT },
      });
    }

    setState(s => {
      const existing = s.pageItems[pageNum];
      let finalItems = items;
      if (existing && existing.length > 0) {
        finalItems = items.map(extractedItem => {
          const match = existing.find(ex => ex.id === extractedItem.id);
          if (match) {
            const hasMoved = Math.abs(match.x - match.originalX) > 0.5 || Math.abs(match.y - match.originalY) > 0.5;
            const deltaX = match.x - match.originalX;
            const deltaY = match.y - match.originalY;

            return {
              ...extractedItem,
              editedText: match.editedText,
              format: { ...match.format },
              isDeleted: match.isDeleted,
              x: hasMoved ? extractedItem.originalX + deltaX : extractedItem.originalX,
              y: hasMoved ? extractedItem.originalY + deltaY : extractedItem.originalY,
            };
          }
          return extractedItem;
        });
        const addedItems = existing.filter(ex => ex.isAdded);
        finalItems = [...finalItems, ...addedItems];
      }

      return {
        ...s,
        pageItems: { ...s.pageItems, [pageNum]: finalItems },
        textItems: pageNum === s.currentPage ? finalItems : s.textItems,
      };
    });

    return items;
  }, []);

  // ── Transactional Text Editing Handlers ─────────────────────────────────────
  const beginTextEdit = useCallback((id: string) => {
    for (const items of Object.values(state.pageItems)) {
      const found = items.find(i => i.id === id);
      if (found) {
        editingPreValueRef.current = { id, originalValue: found.editedText };
        return;
      }
    }
    const currentItem = state.textItems.find(i => i.id === id);
    if (currentItem) {
      editingPreValueRef.current = { id, originalValue: currentItem.editedText };
    }
  }, [state.pageItems, state.textItems]);

  const updateTextWithoutHistory = useCallback((id: string, newText: string) => {
    setState(s => {
      let targetPage = s.currentPage;
      for (const [pStr, items] of Object.entries(s.pageItems)) {
        if (items.some(i => i.id === id)) {
          targetPage = Number(pStr);
          break;
        }
      }
      const pageList = s.pageItems[targetPage] || [];
      const updated = pageList.map(item =>
        item.id === id ? { ...item, editedText: newText } : item
      );
      return {
        ...s,
        isDirty: true,
        textItems: targetPage === s.currentPage ? updated : s.textItems,
        pageItems: { ...s.pageItems, [targetPage]: updated },
      };
    });
  }, []);

  const commitTextEdit = useCallback((id: string) => {
    const pre = editingPreValueRef.current;
    editingPreValueRef.current = null;

    setState(s => {
      let targetItem: PDFTextItem | undefined;
      for (const items of Object.values(s.pageItems)) {
        targetItem = items.find(i => i.id === id);
        if (targetItem) break;
      }
      if (!targetItem) targetItem = s.textItems.find(i => i.id === id);
      if (!targetItem) return s;

      if (!pre || pre.id !== id || pre.originalValue !== targetItem.editedText) {
        const prevPages: Record<number, PDFTextItem[]> = {};
        for (const [k, items] of Object.entries(s.pageItems)) {
          prevPages[Number(k)] = items.map(item =>
            item.id === id && pre ? { ...item, editedText: pre.originalValue, format: { ...item.format } } : { ...item, format: { ...item.format } }
          );
        }
        pushToHistory(prevPages, s.redactions, s.signatures, s.stamps);
      }

      return {
        ...s,
        isDirty: true,
      };
    });
  }, [pushToHistory]);

  const cancelTextEdit = useCallback((id: string) => {
    const pre = editingPreValueRef.current;
    editingPreValueRef.current = null;
    if (!pre || pre.id !== id) return;

    setState(s => {
      let targetPage = s.currentPage;
      for (const [pStr, items] of Object.entries(s.pageItems)) {
        if (items.some(i => i.id === id)) {
          targetPage = Number(pStr);
          break;
        }
      }
      const pageList = s.pageItems[targetPage] || [];
      const updated = pageList.map(item =>
        item.id === id ? { ...item, editedText: pre.originalValue } : item
      );
      return {
        ...s,
        textItems: targetPage === s.currentPage ? updated : s.textItems,
        pageItems: { ...s.pageItems, [targetPage]: updated },
      };
    });
  }, []);

  // ── Standard Update text (Atomic / Programmatic) ───────────────────────────
  const updateText = useCallback((id: string, newText: string) => {
    setState(s => {
      let targetPage = s.currentPage;
      let targetItem: PDFTextItem | undefined;
      for (const [pStr, items] of Object.entries(s.pageItems)) {
        const found = items.find(i => i.id === id);
        if (found) {
          targetPage = Number(pStr);
          targetItem = found;
          break;
        }
      }
      if (targetItem && targetItem.editedText === newText) return s;

      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const pageList = s.pageItems[targetPage] || [];
      const updated = pageList.map(item =>
        item.id === id ? { ...item, editedText: newText } : item
      );
      return {
        ...s,
        isDirty: true,
        textItems: targetPage === s.currentPage ? updated : s.textItems,
        pageItems: { ...s.pageItems, [targetPage]: updated },
      };
    });
  }, [pushToHistory]);

  // ── Update format ──────────────────────────────────────────────────────────
  const updateFormat = useCallback((id: string, partial: Partial<TextFormat>) => {
    setState(s => {
      let targetPage = s.currentPage;
      for (const [pStr, items] of Object.entries(s.pageItems)) {
        if (items.some(i => i.id === id)) {
          targetPage = Number(pStr);
          break;
        }
      }
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const pageList = s.pageItems[targetPage] || [];
      const updated = pageList.map(item =>
        item.id === id ? { ...item, format: { ...item.format, ...partial } } : item
      );
      return {
        ...s,
        isDirty: true,
        textItems: targetPage === s.currentPage ? updated : s.textItems,
        pageItems: { ...s.pageItems, [targetPage]: updated },
      };
    });
  }, [pushToHistory]);

  // ── Update position ────────────────────────────────────────────────────────
  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setState(s => {
      let targetPage = s.currentPage;
      let targetItem: PDFTextItem | undefined;
      for (const [pStr, items] of Object.entries(s.pageItems)) {
        const found = items.find(i => i.id === id);
        if (found) {
          targetPage = Number(pStr);
          targetItem = found;
          break;
        }
      }
      if (targetItem && Math.abs(targetItem.x - x) < 0.1 && Math.abs(targetItem.y - y) < 0.1) return s;

      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const pageList = s.pageItems[targetPage] || [];
      const updated = pageList.map(item =>
        item.id === id ? { ...item, x, y } : item
      );
      return {
        ...s,
        isDirty: true,
        textItems: targetPage === s.currentPage ? updated : s.textItems,
        pageItems: { ...s.pageItems, [targetPage]: updated },
      };
    });
  }, [pushToHistory]);

  // ── Delete item (hides from view + blanks in export) ─────────────────
  const deleteItem = useCallback((id: string) => {
    setState(s => {
      let targetPage = s.currentPage;
      for (const [pStr, items] of Object.entries(s.pageItems)) {
        if (items.some(i => i.id === id)) {
          targetPage = Number(pStr);
          break;
        }
      }
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const pageList = s.pageItems[targetPage] || [];
      const updated = pageList.map(item =>
        item.id === id ? { ...item, isDeleted: true } : item
      );
      return {
        ...s,
        isDirty: true,
        textItems: targetPage === s.currentPage ? updated : s.textItems,
        pageItems: { ...s.pageItems, [targetPage]: updated },
        activeItemId: s.activeItemId === id ? null : s.activeItemId,
      };
    });
  }, [pushToHistory]);

  // ── Add new text field ─────────────────────────────────────────────────────
  const addTextField = useCallback((targetPage?: number) => {
    setState(s => {
      const pageNum = targetPage || s.currentPage;
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const newId = `added-${Date.now()}`;
      const x = 100;
      const y = 120;

      const newItem: PDFTextItem = {
        id: newId,
        pageIndex: pageNum - 1,
        originalText: '',
        editedText: 'New Text',
        x: x * s.scale,
        y: y * s.scale,
        originalX: x * s.scale,
        originalY: y * s.scale,
        width: 120,
        height: 22,
        fontSize: 14 * s.scale,
        transform: [1, 0, 0, 1, x, y],
        fontName: '',
        format: { ...DEFAULT_FORMAT },
        isAdded: true,
      };

      const pageList = s.pageItems[pageNum] || [];
      const updated = [...pageList, newItem];
      return {
        ...s,
        isDirty: true,
        textItems: pageNum === s.currentPage ? updated : s.textItems,
        pageItems: { ...s.pageItems, [pageNum]: updated },
        activeItemId: newId,
        activeTool: 'select',
      };
    });
  }, [pushToHistory]);

  // ── Redaction Box Handlers ──────────────────────────────────────────────────
  const addRedactionBox = useCallback((box: Omit<RedactionBox, 'id' | 'pageIndex'> & { pageIndex?: number }) => {
    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const pageNum = box.pageIndex ?? s.currentPage;
      const newBox: RedactionBox = {
        id: `redact-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pageIndex: pageNum,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        type: box.type,
      };
      const existing = s.redactions[pageNum] || [];
      const updated = [...existing, newBox];
      return {
        ...s,
        isDirty: true,
        redactions: { ...s.redactions, [pageNum]: updated },
        activeRedactionId: newBox.id,
      };
    });
  }, [pushToHistory]);

  const updateRedactionBox = useCallback((id: string, partial: Partial<RedactionBox>) => {
    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const updatedRedactions: Record<number, RedactionBox[]> = {};
      for (const [pg, list] of Object.entries(s.redactions)) {
        updatedRedactions[Number(pg)] = list.map(b => b.id === id ? { ...b, ...partial } : b);
      }
      return {
        ...s,
        isDirty: true,
        redactions: updatedRedactions,
      };
    });
  }, [pushToHistory]);

  const deleteRedactionBox = useCallback((id: string) => {
    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const updatedRedactions: Record<number, RedactionBox[]> = {};
      for (const [pg, list] of Object.entries(s.redactions)) {
        updatedRedactions[Number(pg)] = list.filter(b => b.id !== id);
      }
      return {
        ...s,
        isDirty: true,
        redactions: updatedRedactions,
        activeRedactionId: s.activeRedactionId === id ? null : s.activeRedactionId,
      };
    });
  }, [pushToHistory]);

  // ── Digital Signature Handlers ──────────────────────────────────────────────
  const addSignature = useCallback((sig: Omit<PDFSignatureItem, 'id' | 'pageIndex'> & { pageIndex?: number }) => {
    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const pageNum = sig.pageIndex ?? s.currentPage;
      const newSig: PDFSignatureItem = {
        id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pageIndex: pageNum,
        dataUrl: sig.dataUrl,
        x: sig.x,
        y: sig.y,
        width: sig.width,
        height: sig.height,
      };
      const existing = s.signatures[pageNum] || [];
      const updated = [...existing, newSig];
      return {
        ...s,
        isDirty: true,
        signatures: { ...s.signatures, [pageNum]: updated },
        activeSignatureId: newSig.id,
      };
    });
  }, [pushToHistory]);

  const updateSignature = useCallback((id: string, partial: Partial<PDFSignatureItem>) => {
    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const updatedSignatures: Record<number, PDFSignatureItem[]> = {};
      for (const [pg, list] of Object.entries(s.signatures)) {
        updatedSignatures[Number(pg)] = list.map(sig => sig.id === id ? { ...sig, ...partial } : sig);
      }
      return {
        ...s,
        isDirty: true,
        signatures: updatedSignatures,
      };
    });
  }, [pushToHistory]);

  const deleteSignature = useCallback((id: string) => {
    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const updatedSignatures: Record<number, PDFSignatureItem[]> = {};
      for (const [pg, list] of Object.entries(s.signatures)) {
        updatedSignatures[Number(pg)] = list.filter(sig => sig.id !== id);
      }
      return {
        ...s,
        isDirty: true,
        signatures: updatedSignatures,
        activeSignatureId: s.activeSignatureId === id ? null : s.activeSignatureId,
      };
    });
  }, [pushToHistory]);

  // ── Image & Stamp Inserter Handlers ─────────────────────────────────────────
  const addStamp = useCallback((stamp: Omit<PDFStampItem, 'id' | 'pageIndex'> & { pageIndex?: number }) => {
    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const pageNum = stamp.pageIndex ?? s.currentPage;
      const newStamp: PDFStampItem = {
        id: `stamp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pageIndex: pageNum,
        type: stamp.type,
        dataUrl: stamp.dataUrl,
        label: stamp.label,
        x: stamp.x,
        y: stamp.y,
        width: stamp.width,
        height: stamp.height,
        rotation: stamp.rotation ?? 0,
        opacity: stamp.opacity ?? 0.95,
      };
      const existing = s.stamps[pageNum] || [];
      const updated = [...existing, newStamp];
      return {
        ...s,
        isDirty: true,
        stamps: { ...s.stamps, [pageNum]: updated },
        activeStampId: newStamp.id,
      };
    });
  }, [pushToHistory]);

  const updateStamp = useCallback((id: string, partial: Partial<PDFStampItem>) => {
    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const updatedStamps: Record<number, PDFStampItem[]> = {};
      for (const [pg, list] of Object.entries(s.stamps)) {
        updatedStamps[Number(pg)] = list.map(st => st.id === id ? { ...st, ...partial } : st);
      }
      return {
        ...s,
        isDirty: true,
        stamps: updatedStamps,
      };
    });
  }, [pushToHistory]);

  const deleteStamp = useCallback((id: string) => {
    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const updatedStamps: Record<number, PDFStampItem[]> = {};
      for (const [pg, list] of Object.entries(s.stamps)) {
        updatedStamps[Number(pg)] = list.filter(st => st.id !== id);
      }
      return {
        ...s,
        isDirty: true,
        stamps: updatedStamps,
        activeStampId: s.activeStampId === id ? null : s.activeStampId,
      };
    });
  }, [pushToHistory]);

  // ── Find & Replace Multi-Page Engine (Exact Substring Character Offsets) ─────
  const searchDocumentMatches = useCallback(async (
    query: string,
    matchCase: boolean,
    wholeWord: boolean
  ): Promise<SearchMatch[]> => {
    if (!query || state.totalPages === 0) return [];

    const results: SearchMatch[] = [];
    const flags = matchCase ? 'g' : 'gi';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = wholeWord ? `\\b${escaped}\\b` : escaped;

    for (let p = 1; p <= state.totalPages; p++) {
      const items = state.pageItems[p] || await extractPageItems(p);
      for (const it of items) {
        if (it.isDeleted) continue;
        const text = it.editedText;
        const regex = new RegExp(regexPattern, flags);
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
          results.push({
            itemId: it.id,
            pageNumber: p,
            originalText: it.originalText,
            matchedText: match[0],
            matchStart: match.index,
            matchEnd: match.index + match[0].length,
            query,
            matchCase,
            wholeWord,
          });

          // Prevent infinite loop on empty match regex
          if (regex.lastIndex === match.index) {
            regex.lastIndex++;
          }
        }
      }
    }

    return results;
  }, [state.totalPages, state.pageItems, extractPageItems]);

  // ── Replace Single Match (Exact Substring Slicing) ───────────────────────────
  const replaceSingleMatch = useCallback((
    itemIdOrMatch: string | SearchMatch,
    pageNumberOrReplacement: number | string,
    replaceWithArg?: string,
    queryArg?: string,
    matchCaseArg?: boolean,
    wholeWordArg?: boolean,
    matchStartArg?: number,
    matchEndArg?: number
  ) => {
    let itemId: string;
    let pageNumber: number;
    let replaceWith: string;
    let query: string;
    let matchCase: boolean;
    let wholeWord: boolean;
    let matchStart: number | undefined;
    let matchEnd: number | undefined;

    if (typeof itemIdOrMatch === 'string') {
      itemId = itemIdOrMatch;
      pageNumber = Number(pageNumberOrReplacement);
      replaceWith = replaceWithArg ?? '';
      query = queryArg ?? '';
      matchCase = matchCaseArg ?? false;
      wholeWord = wholeWordArg ?? false;
      matchStart = matchStartArg;
      matchEnd = matchEndArg;
    } else {
      const matchObj = itemIdOrMatch;
      itemId = matchObj.itemId;
      pageNumber = matchObj.pageNumber;
      replaceWith = String(pageNumberOrReplacement);
      query = matchObj.query || matchObj.matchedText;
      matchCase = matchObj.matchCase;
      wholeWord = matchObj.wholeWord;
      matchStart = matchObj.matchStart;
      matchEnd = matchObj.matchEnd;
    }

    setState(s => {
      pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
      const targetPageItems = s.pageItems[pageNumber] || [];

      const updated = targetPageItems.map(item => {
        if (item.id !== itemId) return item;

        const currentText = item.editedText;

        // 1. Direct character slice if offsets are provided and still match
        if (
          matchStart !== undefined &&
          matchEnd !== undefined &&
          matchStart >= 0 &&
          matchEnd <= currentText.length
        ) {
          const sliceCandidate = currentText.slice(matchStart, matchEnd);
          const candidateMatches = matchCase
            ? sliceCandidate === query
            : sliceCandidate.toLowerCase() === query.toLowerCase();

          if (candidateMatches) {
            const before = currentText.slice(0, matchStart);
            const after = currentText.slice(matchEnd);
            return {
              ...item,
              editedText: before + replaceWith + after,
            };
          }
        }

        // 2. Fallback: Search first exact regex match in current text and replace only that occurrence
        const flags = matchCase ? '' : 'i';
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(wholeWord ? `\\b${escaped}\\b` : escaped, flags);
        const matchResult = regex.exec(currentText);

        if (matchResult) {
          const idx = matchResult.index;
          const len = matchResult[0].length;
          const before = currentText.slice(0, idx);
          const after = currentText.slice(idx + len);
          return {
            ...item,
            editedText: before + replaceWith + after,
          };
        }

        return item;
      });

      const newPageItems = { ...s.pageItems, [pageNumber]: updated };
      const newTextItems = s.currentPage === pageNumber ? updated : s.textItems;

      return {
        ...s,
        isDirty: true,
        pageItems: newPageItems,
        textItems: newTextItems,
      };
    });
  }, [pushToHistory]);

  // ── Replace All Matches (Exact Substring Across Entire Document) ─────────────
  const replaceAllMatches = useCallback(async (
    query: string,
    replaceWith: string,
    matchCase: boolean,
    wholeWord: boolean
  ): Promise<number> => {
    if (!query || state.totalPages === 0) return 0;

    const flags = matchCase ? 'g' : 'gi';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = wholeWord ? `\\b${escaped}\\b` : escaped;

    let totalReplaced = 0;
    const newPageItems: Record<number, PDFTextItem[]> = {};

    for (let p = 1; p <= state.totalPages; p++) {
      const items = state.pageItems[p] || await extractPageItems(p);
      const updated = items.map(it => {
        if (it.isDeleted) return it;
        const regex = new RegExp(regexPattern, flags);
        const originalText = it.editedText;
        const matchesCount = (originalText.match(regex) || []).length;
        if (matchesCount > 0) {
          totalReplaced += matchesCount;
          return {
            ...it,
            editedText: originalText.replace(regex, replaceWith),
          };
        }
        return it;
      });
      newPageItems[p] = updated;
    }

    if (totalReplaced > 0) {
      setState(s => {
        pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
        return {
          ...s,
          isDirty: true,
          pageItems: newPageItems,
          textItems: newPageItems[s.currentPage] || s.textItems,
        };
      });
    }

    return totalReplaced;
  }, [state.totalPages, state.pageItems, extractPageItems, pushToHistory]);

  // ── Redact All Matches (Precision Substring Bounding Boxes) ──────────────────
  const redactAllMatches = useCallback(async (
    query: string,
    matchCase: boolean,
    wholeWord: boolean
  ): Promise<number> => {
    if (!query || state.totalPages === 0) return 0;

    const flags = matchCase ? 'g' : 'gi';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = wholeWord ? `\\b${escaped}\\b` : escaped;

    let totalRedacted = 0;
    const newRedactions: Record<number, RedactionBox[]> = {};

    for (let p = 1; p <= state.totalPages; p++) {
      const existingBoxes = state.redactions[p] || [];
      const addedBoxes: RedactionBox[] = [];
      const items = state.pageItems[p] || await extractPageItems(p);

      for (const it of items) {
        if (it.isDeleted) continue;
        const text = it.editedText;
        const regex = new RegExp(regexPattern, flags);
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
          totalRedacted++;
          const matchStart = match.index;
          const matchEnd = match.index + match[0].length;
          const box = calculateSubstringBox(it, matchStart, matchEnd);

          addedBoxes.push({
            id: `redact-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            pageIndex: p,
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            type: 'blackout',
          });

          if (regex.lastIndex === match.index) {
            regex.lastIndex++;
          }
        }
      }
      newRedactions[p] = [...existingBoxes, ...addedBoxes];
    }

    if (totalRedacted > 0) {
      setState(s => {
        pushToHistory(s.pageItems, s.redactions, s.signatures, s.stamps);
        return {
          ...s,
          isDirty: true,
          redactions: newRedactions,
        };
      });
    }

    return totalRedacted;
  }, [state.totalPages, state.pageItems, state.redactions, extractPageItems, pushToHistory]);

  const setActiveItem = useCallback((id: string | null) => setState(s => ({ ...s, activeItemId: id })), []);
  const setActiveRedaction = useCallback((id: string | null) => setState(s => ({ ...s, activeRedactionId: id })), []);
  const setActiveSignature = useCallback((id: string | null) => setState(s => ({ ...s, activeSignatureId: id })), []);
  const setActiveStamp = useCallback((id: string | null) => setState(s => ({ ...s, activeStampId: id })), []);
  const setActiveTool = useCallback((tool: EditorTool) => setState(s => ({ ...s, activeTool: tool })), []);
  const setExportMode = useCallback((mode: ExportMode) => setState(s => ({ ...s, exportMode: mode })), []);
  const setSanitizeMetadata = useCallback((sanitize: boolean) => setState(s => ({ ...s, sanitizeMetadata: sanitize })), []);
  const setVerifyOnExport = useCallback((verify: boolean) => setState(s => ({ ...s, verifyOnExport: verify })), []);
  const setVerificationReport = useCallback((report: VerificationReport | null) => setState(s => ({ ...s, verificationReport: report })), []);
  const setCurrentPage = useCallback((page: number) => setState(s => ({ ...s, currentPage: page })), []);

  const setScale = useCallback((newScale: number) => {
    setState(s => {
      const oldScale = s.scale;
      if (oldScale === newScale || oldScale <= 0) return { ...s, scale: newScale };
      const factor = newScale / oldScale;

      // Rescale all pageItems
      const newPageItems: Record<number, PDFTextItem[]> = {};
      for (const [pageNumStr, items] of Object.entries(s.pageItems)) {
        const pageNum = Number(pageNumStr);
        newPageItems[pageNum] = items.map(item => ({
          ...item,
          x: item.x * factor,
          y: item.y * factor,
          originalX: item.originalX * factor,
          originalY: item.originalY * factor,
          width: item.width * factor,
          height: item.height * factor,
          fontSize: item.fontSize * factor,
          format: { ...item.format },
        }));
      }

      // Rescale redaction boxes
      const newRedactions: Record<number, RedactionBox[]> = {};
      for (const [pageNumStr, boxes] of Object.entries(s.redactions)) {
        const pageNum = Number(pageNumStr);
        newRedactions[pageNum] = boxes.map(box => ({
          ...box,
          x: box.x * factor,
          y: box.y * factor,
          width: box.width * factor,
          height: box.height * factor,
        }));
      }

      // Rescale digital signatures
      const newSignatures: Record<number, PDFSignatureItem[]> = {};
      for (const [pageNumStr, sigs] of Object.entries(s.signatures)) {
        const pageNum = Number(pageNumStr);
        newSignatures[pageNum] = sigs.map(sig => ({
          ...sig,
          x: sig.x * factor,
          y: sig.y * factor,
          width: sig.width * factor,
          height: sig.height * factor,
        }));
      }

      // Rescale stamps & images
      const newStamps: Record<number, PDFStampItem[]> = {};
      for (const [pageNumStr, stampList] of Object.entries(s.stamps)) {
        const pageNum = Number(pageNumStr);
        newStamps[pageNum] = stampList.map(st => ({
          ...st,
          x: st.x * factor,
          y: st.y * factor,
          width: st.width * factor,
          height: st.height * factor,
        }));
      }

      const newCurrentTextItems = newPageItems[s.currentPage] || s.textItems.map(item => ({
        ...item,
        x: item.x * factor,
        y: item.y * factor,
        originalX: item.originalX * factor,
        originalY: item.originalY * factor,
        width: item.width * factor,
        height: item.height * factor,
        fontSize: item.fontSize * factor,
        format: { ...item.format },
      }));

      return {
        ...s,
        scale: newScale,
        pageItems: newPageItems,
        textItems: newCurrentTextItems,
        redactions: newRedactions,
        signatures: newSignatures,
        stamps: newStamps,
      };
    });
  }, []);

  // ── Core PDF Binary Generation Helper ───────────────────────────────────────
  const generatePDFBytes = useCallback(async (chosenMode: ExportMode): Promise<Uint8Array> => {
    const pdfDoc = pdfDocRef.current;
    if (!rawBytesRef.current || !pdfDoc) throw new Error('No PDF document loaded');

    // Check if blackout redactions exist
    const hasBlackoutRedaction = Object.values(state.redactions)
      .some(list => list.some(box => box.type === 'blackout'));

    // Enforce safety: Do not allow silent vector export of confidential blackout redactions
    const effectiveMode = (hasBlackoutRedaction && chosenMode === 'vector') ? 'sanitized' : chosenMode;

    if (effectiveMode === 'sanitized') {
      const cleanDoc = await PDFDocument.create();
      // True 300 DPI Export Scale: 300 / 72 points per inch ≈ 4.1667 (with safe cap for high page counts)
      const exportScale = state.totalPages > 25 ? 2.5 : (300 / 72);

      for (let p = 1; p <= state.totalPages; p++) {
        const page = await pdfDoc.getPage(p);
        const origViewport = page.getViewport({ scale: 1.0 });
        const hiResViewport = page.getViewport({ scale: exportScale });

        const offCanvas = document.createElement('canvas');
        offCanvas.width = hiResViewport.width;
        offCanvas.height = hiResViewport.height;
        const offCtx = offCanvas.getContext('2d')!;

        await page.render({ canvasContext: offCtx, viewport: hiResViewport, canvas: offCanvas }).promise;

        const ratio = exportScale / state.scale;

        // 1. Draw Deleted / Modified Text Whiteouts
        const pageItems = state.pageItems[p] || (p === state.currentPage ? state.textItems : []);
        for (const item of pageItems) {
          const hasTextChange = item.editedText !== item.originalText;
          const hasFmtChange = item.format.bold || item.format.italic || item.format.underline ||
                               item.format.fontFamily !== 'helvetica' || item.format.fontSizeDelta !== 0 ||
                               item.format.color !== '#000000' || item.format.link !== '';
          const hasPosChange = Math.abs(item.x - item.originalX) > 0.5 || Math.abs(item.y - item.originalY) > 0.5;
          const isDeleted = !!item.isDeleted;
          const isAdded = !!item.isAdded;

          if (!isAdded && (isDeleted || hasTextChange || hasFmtChange || hasPosChange)) {
            offCtx.fillStyle = '#ffffff';
            offCtx.fillRect(
              item.originalX * ratio - 1,
              item.originalY * ratio - 1,
              (item.width + 2) * ratio,
              (item.height + 2) * ratio
            );
          }

          if (!isDeleted && (hasTextChange || hasFmtChange || hasPosChange || isAdded)) {
            const itemFontSize = (item.fontSize + item.format.fontSizeDelta) * ratio;
            const fontStyle = item.format.italic ? 'italic ' : '';
            const fontWeight = item.format.bold ? 'bold ' : 'normal ';
            const fontFamily = item.format.fontFamily === 'times' ? 'Georgia, "Times New Roman", Times, serif' :
                               item.format.fontFamily === 'courier' ? '"Courier New", Courier, monospace' :
                               'Helvetica, Arial, sans-serif';

            offCtx.font = `${fontStyle}${fontWeight}${Math.max(itemFontSize, 8)}px ${fontFamily}`;
            offCtx.fillStyle = item.format.color;
            offCtx.textBaseline = 'top';
            offCtx.fillText(item.editedText, item.x * ratio, item.y * ratio);

            if (item.format.underline) {
              const textWidth = offCtx.measureText(item.editedText).width;
              offCtx.strokeStyle = item.format.color;
              offCtx.lineWidth = Math.max(itemFontSize * 0.08, 1);
              offCtx.beginPath();
              offCtx.moveTo(item.x * ratio, (item.y + item.height) * ratio);
              offCtx.lineTo(item.x * ratio + textWidth, (item.y + item.height) * ratio);
              offCtx.stroke();
            }
          }
        }

        // 2. Draw Blackout / Whiteout Redaction Boxes
        const pageRedactions = state.redactions[p] || [];
        for (const box of pageRedactions) {
          offCtx.fillStyle = box.type === 'blackout' ? '#000000' : '#ffffff';
          offCtx.fillRect(box.x * ratio, box.y * ratio, box.width * ratio, box.height * ratio);
        }

        // 3. Draw Digital Signatures
        const pageSignatures = state.signatures[p] || [];
        for (const sig of pageSignatures) {
          const img = new Image();
          img.src = sig.dataUrl;
          await new Promise(resolve => {
            if (img.complete) resolve(null);
            else {
              img.onload = () => resolve(null);
              img.onerror = () => resolve(null);
            }
          });
          offCtx.drawImage(img, sig.x * ratio, sig.y * ratio, sig.width * ratio, sig.height * ratio);
        }

        // 4. Draw Official Stamps & Images (with rotation and opacity)
        const pageStamps = state.stamps[p] || [];
        for (const stamp of pageStamps) {
          const img = new Image();
          img.src = stamp.dataUrl;
          await new Promise(resolve => {
            if (img.complete) resolve(null);
            else {
              img.onload = () => resolve(null);
              img.onerror = () => resolve(null);
            }
          });

          const cx = (stamp.x + stamp.width / 2) * ratio;
          const cy = (stamp.y + stamp.height / 2) * ratio;
          const sw = stamp.width * ratio;
          const sh = stamp.height * ratio;

          offCtx.save();
          offCtx.translate(cx, cy);
          offCtx.rotate((stamp.rotation * Math.PI) / 180);
          offCtx.globalAlpha = stamp.opacity;
          offCtx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
          offCtx.restore();
        }

        // High quality raster embedding
        const dataUrl = offCanvas.toDataURL('image/png');
        const pngBytes = dataUrlToUint8Array(dataUrl);
        const embeddedPng = await cleanDoc.embedPng(pngBytes);

        const newPage = cleanDoc.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(embeddedPng, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height,
        });
      }

      if (state.sanitizeMetadata) {
        cleanDoc.setTitle('');
        cleanDoc.setAuthor('');
        cleanDoc.setSubject('');
        cleanDoc.setKeywords([]);
        cleanDoc.setProducer('EditPDF Client-Side Sanitization Engine');
        cleanDoc.setCreator('EditPDF 100% In-Browser');
      }

      return await cleanDoc.save();
    } else {
      // Vector Overlay Mode
      const pdfLibDoc = await PDFDocument.load(rawBytesRef.current.slice(0));
      const pages = pdfLibDoc.getPages();

      const fontCache: Partial<Record<StandardFonts, Awaited<ReturnType<typeof pdfLibDoc.embedFont>>>> = {};
      const getFont = async (key: StandardFonts) => {
        if (!fontCache[key]) fontCache[key] = await pdfLibDoc.embedFont(key);
        return fontCache[key]!;
      };

      const neededFonts = new Set<StandardFonts>();
      for (const pgItems of Object.values(state.pageItems)) {
        for (const item of pgItems) {
          if (item.isDeleted) continue;
          neededFonts.add(resolveStdFont(item.format));
        }
      }
      await Promise.all([...neededFonts].map(f => getFont(f)));
      await getFont(StandardFonts.Helvetica);

      const pdfScale = 1 / state.scale;

      for (let p = 1; p <= pages.length; p++) {
        const page = pages[p - 1];
        const pageHeight = page.getHeight();

        // 1. Draw Redaction Boxes (Whiteout / Overlay)
        const pageRedactions = state.redactions[p] || [];
        for (const box of pageRedactions) {
          const pdfX = box.x * pdfScale;
          const pdfY = pageHeight - ((box.y + box.height) * pdfScale);
          page.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: box.width * pdfScale,
            height: box.height * pdfScale,
            color: box.type === 'blackout' ? rgb(0, 0, 0) : rgb(1, 1, 1),
            opacity: 1,
          });
        }

        // 2. Draw Text Overlays
        const pageItems = state.pageItems[p] || (p === state.currentPage ? state.textItems : []);
        for (const item of pageItems) {
          const hasTextChange = item.editedText !== item.originalText;
          const hasFmtChange = item.format.bold || item.format.italic || item.format.underline ||
                               item.format.fontFamily !== 'helvetica' || item.format.fontSizeDelta !== 0 ||
                               item.format.color !== '#000000' || item.format.link !== '';
          const hasPosChange = Math.abs(item.x - item.originalX) > 0.1 || Math.abs(item.y - item.originalY) > 0.1;
          const isDeleted = !!item.isDeleted;
          const isAdded = !!item.isAdded;

          if (!hasTextChange && !hasFmtChange && !hasPosChange && !isDeleted && !isAdded) continue;

          const pdfX_orig = item.transform[4];
          const pdfY_orig = item.transform[5];

          if (!isAdded) {
            const rectW = item.width * pdfScale + 4;
            const rectH = item.height * pdfScale + 2;
            page.drawRectangle({
              x: pdfX_orig - 1,
              y: pdfY_orig - 1,
              width: Math.max(rectW, 10),
              height: Math.max(rectH, 6),
              color: rgb(1, 1, 1),
              opacity: 1,
            });
          }

          if (isDeleted) continue;

          const pdfX_new = item.x * pdfScale;
          const pdfY_new = pageHeight - ((item.y + item.height) * pdfScale);
          const fmt = item.format;
          const pdfFontSize = Math.max((item.fontSize + fmt.fontSizeDelta) * pdfScale, 4);
          const textToDraw = item.editedText;
          const { r, g, b } = hexToRgb01(fmt.color);
          const font = await getFont(resolveStdFont(fmt));

          page.drawText(textToDraw, {
            x: pdfX_new,
            y: pdfY_new,
            size: pdfFontSize,
            font,
            color: rgb(r, g, b),
          });

          if (fmt.underline) {
            const textWidth = font.widthOfTextAtSize(textToDraw, pdfFontSize);
            page.drawLine({
              start: { x: pdfX_new, y: pdfY_new - 1 },
              end: { x: pdfX_new + textWidth, y: pdfY_new - 1 },
              thickness: Math.max(pdfFontSize * 0.06, 0.5),
              color: rgb(r, g, b),
            });
          }
        }

        // 3. Draw Digital Signatures in Vector Mode
        const pageSignatures = state.signatures[p] || [];
        for (const sig of pageSignatures) {
          try {
            const pngBytes = dataUrlToUint8Array(sig.dataUrl);
            const embeddedPng = await pdfLibDoc.embedPng(pngBytes);
            const pdfX = sig.x * pdfScale;
            const pdfY = pageHeight - ((sig.y + sig.height) * pdfScale);
            page.drawImage(embeddedPng, {
              x: pdfX,
              y: pdfY,
              width: sig.width * pdfScale,
              height: sig.height * pdfScale,
            });
          } catch (err) {
            console.error('Failed to embed signature PNG in vector mode:', err);
          }
        }

        // 4. Draw Official Stamps & Images in Vector Mode
        const pageStamps = state.stamps[p] || [];
        for (const stamp of pageStamps) {
          try {
            const pngBytes = dataUrlToUint8Array(stamp.dataUrl);
            const embeddedPng = await pdfLibDoc.embedPng(pngBytes);
            const pdfX = stamp.x * pdfScale;
            const pdfY = pageHeight - ((stamp.y + stamp.height) * pdfScale);
            page.drawImage(embeddedPng, {
              x: pdfX,
              y: pdfY,
              width: stamp.width * pdfScale,
              height: stamp.height * pdfScale,
              rotate: degrees(stamp.rotation),
              opacity: stamp.opacity,
            });
          } catch (err) {
            console.error('Failed to embed stamp PNG in vector mode:', err);
          }
        }
      }

      if (state.sanitizeMetadata) {
        pdfLibDoc.setTitle('');
        pdfLibDoc.setAuthor('');
        pdfLibDoc.setSubject('');
        pdfLibDoc.setKeywords([]);
      }

      return await pdfLibDoc.save();
    }
  }, [state]);

  // ── Redaction Verification Audit Scanner ────────────────────────────────────
  const runVerificationAudit = useCallback(async (pdfBytes: Uint8Array, mode: ExportMode): Promise<VerificationReport> => {
    const termsToCheck: { term: string; pageIndex: number }[] = [];
    const seen = new Set<string>();

    // Collect all phrases marked for deletion, replacement, or under blackout boxes
    for (const [pgStr, items] of Object.entries(state.pageItems)) {
      const pageNum = Number(pgStr);
      const redactionBoxes = state.redactions[pageNum] || [];

      for (const item of items) {
        const orig = item.originalText.trim();
        if (!orig || orig.length < 2) continue;

        const isDel = !!item.isDeleted;
        const isEdited = item.editedText !== item.originalText;
        const isUnderRedactionBox = redactionBoxes.some(box => (
          item.x < box.x + box.width &&
          item.x + item.width > box.x &&
          item.y < box.y + box.height &&
          item.y + item.height > box.y
        ));

        if (isDel || isEdited || isUnderRedactionBox) {
          const key = `${pageNum}:${orig}`;
          if (!seen.has(key)) {
            seen.add(key);
            termsToCheck.push({ term: orig, pageIndex: pageNum });
          }
        }
      }
    }

    // Check current page items
    const curPageItems = state.textItems || [];
    const curPageRedactions = state.redactions[state.currentPage] || [];
    for (const item of curPageItems) {
      const orig = item.originalText.trim();
      if (!orig || orig.length < 2) continue;
      const isDel = !!item.isDeleted;
      const isEdited = item.editedText !== item.originalText;
      const isUnderRedactionBox = curPageRedactions.some(box => (
        item.x < box.x + box.width &&
        item.x + item.width > box.x &&
        item.y < box.y + box.height &&
        item.y + item.height > box.y
      ));

      if (isDel || isEdited || isUnderRedactionBox) {
        const key = `${state.currentPage}:${orig}`;
        if (!seen.has(key)) {
          seen.add(key);
          termsToCheck.push({ term: orig, pageIndex: state.currentPage });
        }
      }
    }

    // Parse the newly generated PDF and extract text streams across all pages
    const checks: VerificationCheck[] = [];
    const testDoc = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) }).promise;

    const pageTexts: Record<number, string> = {};
    for (let p = 1; p <= testDoc.numPages; p++) {
      const page = await testDoc.getPage(p);
      const content = await page.getTextContent();
      const textStr = content.items
        .map(it => ('str' in it ? it.str : ''))
        .join(' ')
        .toLowerCase();
      pageTexts[p] = textStr;
    }

    for (const { term, pageIndex } of termsToCheck) {
      const termLower = term.toLowerCase();
      let totalOccurrences = 0;
      for (const pText of Object.values(pageTexts)) {
        if (pText.includes(termLower)) {
          totalOccurrences++;
        }
      }

      checks.push({
        term,
        pageIndex,
        foundCount: totalOccurrences,
        status: totalOccurrences === 0 ? 'purged' : 'detected',
      });
    }

    const allPassed = checks.every(c => c.status === 'purged');

    return {
      timestamp: Date.now(),
      mode,
      totalChecked: checks.length,
      passed: allPassed,
      checks,
      metadataStripped: state.sanitizeMetadata,
      auditNote: allPassed
        ? 'The exported PDF was scanned and the redacted terms were not found in extractable PDF text.'
        : 'Sensitive redacted terms were detected in the underlying extractable text streams.',
    };
  }, [state]);

  // ── Standalone Verification Runner ──────────────────────────────────────────
  const runStandaloneVerification = useCallback(async (): Promise<VerificationReport | null> => {
    setState(s => ({ ...s, isVerifying: true, error: null }));
    try {
      const pdfBytes = await generatePDFBytes(state.exportMode);
      const report = await runVerificationAudit(pdfBytes, state.exportMode);
      setState(s => ({ ...s, isVerifying: false, verificationReport: report }));
      return report;
    } catch (err) {
      console.error(err);
      setState(s => ({ ...s, isVerifying: false, error: 'Verification scan failed.' }));
      return null;
    }
  }, [generatePDFBytes, runVerificationAudit, state.exportMode]);

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const exportPDF = useCallback(async (modeOverride?: ExportMode, shouldTriggerDownload = true) => {
    const pdfDoc = pdfDocRef.current;
    if (!rawBytesRef.current || !pdfDoc) return;
    setState(s => ({ ...s, isExporting: true, error: null }));

    const hasBlackoutRedaction = Object.values(state.redactions)
      .some(list => list.some(box => box.type === 'blackout'));

    const requestedMode = modeOverride || state.exportMode;
    // Gating rule: Blackout redaction forces sanitized mode
    const chosenMode: ExportMode = (hasBlackoutRedaction && requestedMode === 'vector')
      ? 'sanitized'
      : requestedMode;

    try {
      const pdfBytes = await generatePDFBytes(chosenMode);

      // Run optional verification scan
      if (state.verifyOnExport) {
        const report = await runVerificationAudit(pdfBytes, chosenMode);
        setState(s => ({ ...s, verificationReport: report }));
      }

      if (shouldTriggerDownload) {
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.fileName.replace(/\.pdf$/i, '') + (chosenMode === 'sanitized' ? '_sanitized.pdf' : '_edited.pdf');
        a.click();
        URL.revokeObjectURL(url);
      }

      setState(s => ({ ...s, isExporting: false }));
    } catch (err) {
      console.error(err);
      setState(s => ({ ...s, isExporting: false, error: 'Export failed. Please try again.' }));
    }
  }, [generatePDFBytes, runVerificationAudit, state.exportMode, state.fileName, state.redactions, state.verifyOnExport]);

  const resetEditor = useCallback(() => {
    if (pdfDocRef.current) {
      try {
        pdfDocRef.current.cleanup();
        (pdfDocRef.current as { destroy?: () => void }).destroy?.();
      } catch { /* ignore */ }
      pdfDocRef.current = null;
    }
    rawBytesRef.current = null;
    historyRef.current = [];
    futureRef.current = [];
    editingPreValueRef.current = null;

    // Cancel all in-progress renders
    renderTasksRef.current.forEach(t => { try { t.cancel(); } catch {} });
    renderTasksRef.current.clear();

    setState({
      fileName: '',
      totalPages: 0,
      currentPage: 1,
      scale: DEFAULT_SCALE,
      pageDimensions: {},
      textItems: [],
      pageItems: {},
      redactions: {},
      signatures: {},
      stamps: {},
      activeItemId: null,
      activeRedactionId: null,
      activeSignatureId: null,
      activeStampId: null,
      activeTool: 'select',
      exportMode: 'sanitized',
      sanitizeMetadata: true,
      verifyOnExport: true,
      verificationReport: null,
      isVerifying: false,
      isDirty: false,
      isLoading: false,
      isExporting: false,
      error: null,
    });
  }, []);

  return {
    state,
    loadPDF,
    renderPage,
    cancelPageRender,
    beginTextEdit,
    updateTextWithoutHistory,
    commitTextEdit,
    cancelTextEdit,
    updateText,
    updateFormat,
    updatePosition,
    deleteItem,
    addTextField,
    addRedactionBox,
    updateRedactionBox,
    deleteRedactionBox,
    addSignature,
    updateSignature,
    deleteSignature,
    setActiveSignature,
    addStamp,
    updateStamp,
    deleteStamp,
    setActiveStamp,
    searchDocumentMatches,
    replaceSingleMatch,
    replaceAllMatches,
    redactAllMatches,
    setActiveRedaction,
    setActiveTool,
    setExportMode,
    setSanitizeMetadata,
    setVerifyOnExport,
    setVerificationReport,
    runStandaloneVerification,
    undo,
    redo,
    setActiveItem,
    setCurrentPage,
    setScale,
    exportPDF,
    resetEditor,
  };
}
