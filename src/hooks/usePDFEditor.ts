import { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { PDFTextItem, TextFormat, PDFEditorState } from '../types/pdf';
import { DEFAULT_FORMAT } from '../types/pdf';

// Worker served locally from /public to avoid CDN version mismatch
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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

export function usePDFEditor() {
  const [state, setState] = useState<PDFEditorState>({
    fileName: '',
    totalPages: 0,
    currentPage: 1,
    scale: DEFAULT_SCALE,
    textItems: [],
    activeItemId: null,
    isDirty: false,
    isLoading: false,
    isExporting: false,
    error: null,
  });

  const pdfDocRef   = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const rawBytesRef = useRef<ArrayBuffer | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const currentRenderIdRef = useRef<number>(0);

  // Undo / Redo Stacks
  const historyRef = useRef<PDFTextItem[][]>([]);
  const futureRef = useRef<PDFTextItem[][]>([]);

  // Push helper for history tracking
  const pushToHistory = useCallback((currentItems: PDFTextItem[]) => {
    historyRef.current.push(
      currentItems.map(item => ({
        ...item,
        format: { ...item.format },
      }))
    );
    futureRef.current = []; // Clear redo stack on new action
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const previous = historyRef.current.pop()!;
    setState(s => {
      futureRef.current.push(
        s.textItems.map(item => ({
          ...item,
          format: { ...item.format },
        }))
      );
      return {
        ...s,
        textItems: previous,
        isDirty: true,
      };
    });
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    setState(s => {
      historyRef.current.push(
        s.textItems.map(item => ({
          ...item,
          format: { ...item.format },
        }))
      );
      return {
        ...s,
        textItems: next,
        isDirty: true,
      };
    });
  }, []);

  // ── Load PDF ──────────────────────────────────────────────────────────────
  const loadPDF = useCallback(async (file: File) => {
    setState(s => ({ ...s, isLoading: true, error: null, textItems: [], activeItemId: null }));
    try {
      const buffer = await file.arrayBuffer();
      rawBytesRef.current = buffer.slice(0);

      const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
      const pdfDoc = await loadingTask.promise;
      pdfDocRef.current = pdfDoc;

      setState(s => ({
        ...s,
        fileName: file.name,
        totalPages: pdfDoc.numPages,
        currentPage: 1,
        isDirty: false,
        isLoading: false,
      }));
    } catch (err) {
      console.error(err);
      setState(s => ({ ...s, isLoading: false, error: 'Failed to load PDF. Make sure it is a valid text-based PDF file.' }));
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

    const renderId = ++currentRenderIdRef.current;

    // Cancel any in-progress render on the same canvas
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (_) { /* ignore */ }
      renderTaskRef.current = null;
    }

    const page = await pdfDoc.getPage(pageNum);

    // If a new render request has been triggered in the meantime, abort this one
    if (renderId !== currentRenderIdRef.current) return [];

    const viewport = page.getViewport({ scale });

    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    // Start render and store task reference
    const task = page.render({ canvasContext: ctx, viewport, canvas });
    renderTaskRef.current = task;

    try {
      await task.promise;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'RenderingCancelledException') return [];
      throw err;
    }
    renderTaskRef.current = null;

    // Reset undo history when page changes
    historyRef.current = [];
    futureRef.current = [];

    // Extract text items with positions
    const textContent = await page.getTextContent();
    const items: PDFTextItem[] = [];

    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue;

      const tx = item.transform as number[];
      const [, , , scaleY, x, y] = tx;
      const fontSize = Math.abs(scaleY);

      const pt    = viewport.convertToViewportPoint(x, y);
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
        width:  Math.max(cw, 20),
        height: Math.max(ch, 10),
        fontSize: fontSize * scale,
        transform: tx,
        fontName: (item as { fontName?: string }).fontName ?? '',
        format: { ...DEFAULT_FORMAT },
      });
    }

    setState(s => ({
      ...s,
      textItems: items,
      currentPage: pageNum,
      scale,
      activeItemId: null,
    }));

    return items;
  }, []);

  // ── Update text ────────────────────────────────────────────────────────────
  const updateText = useCallback((id: string, newText: string) => {
    setState(s => {
      pushToHistory(s.textItems);
      return {
        ...s,
        isDirty: true,
        textItems: s.textItems.map(item =>
          item.id === id ? { ...item, editedText: newText } : item
        ),
      };
    });
  }, [pushToHistory]);

  // ── Update format ──────────────────────────────────────────────────────────
  const updateFormat = useCallback((id: string, partial: Partial<TextFormat>) => {
    setState(s => {
      pushToHistory(s.textItems);
      return {
        ...s,
        isDirty: true,
        textItems: s.textItems.map(item =>
          item.id === id ? { ...item, format: { ...item.format, ...partial } } : item
        ),
      };
    });
  }, [pushToHistory]);

  // ── Update position ────────────────────────────────────────────────────────
  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setState(s => {
      pushToHistory(s.textItems);
      return {
        ...s,
        isDirty: true,
        textItems: s.textItems.map(item =>
          item.id === id ? { ...item, x, y } : item
        ),
      };
    });
  }, [pushToHistory]);

  // ── Delete item (hides from view + blanks in export) ─────────────────
  const deleteItem = useCallback((id: string) => {
    setState(s => {
      pushToHistory(s.textItems);
      return {
        ...s,
        isDirty: true,
        textItems: s.textItems.map(item =>
          item.id === id ? { ...item, isDeleted: true } : item
        ),
        activeItemId: s.activeItemId === id ? null : s.activeItemId,
      };
    });
  }, [pushToHistory]);

  // ── Add new text field ─────────────────────────────────────────────────────
  const addTextField = useCallback(() => {
    setState(s => {
      pushToHistory(s.textItems);
      const newId = `added-${Date.now()}`;
      
      // Default position: offset from top-left (scaled by scale factor)
      const x = 100;
      const y = 120;
      
      const newItem: PDFTextItem = {
        id: newId,
        pageIndex: s.currentPage - 1,
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

      return {
        ...s,
        isDirty: true,
        textItems: [...s.textItems, newItem],
        activeItemId: newId,
      };
    });
  }, [pushToHistory]);

  const setActiveItem   = useCallback((id: string | null) => setState(s => ({ ...s, activeItemId: id })), []);
  const setCurrentPage  = useCallback((page: number) => setState(s => ({ ...s, currentPage: page })), []);
  const setScale        = useCallback((scale: number) => setState(s => ({ ...s, scale })), []);

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const exportPDF = useCallback(async () => {
    if (!rawBytesRef.current || !pdfDocRef.current) return;
    setState(s => ({ ...s, isExporting: true, error: null }));

    try {
      const pdfLibDoc = await PDFDocument.load(rawBytesRef.current.slice(0));
      const pages = pdfLibDoc.getPages();

      // Pre-embed all needed font variants
      const fontCache: Partial<Record<StandardFonts, Awaited<ReturnType<typeof pdfLibDoc.embedFont>>>> = {};
      const getFont = async (key: StandardFonts) => {
        if (!fontCache[key]) fontCache[key] = await pdfLibDoc.embedFont(key);
        return fontCache[key]!;
      };

      // Collect all font keys we need
      const neededFonts = new Set<StandardFonts>();
      for (const item of state.textItems) {
        if (item.isDeleted) continue;
        if (item.editedText !== item.originalText || item.format.bold || item.format.italic ||
            item.format.fontFamily !== 'helvetica' || item.format.fontSizeDelta !== 0 ||
            item.format.color !== '#000000') {
          neededFonts.add(resolveStdFont(item.format));
        }
      }
      await Promise.all([...neededFonts].map(f => getFont(f)));
      await getFont(StandardFonts.Helvetica); // Always have a fallback

      const pdfScale = 1 / state.scale;

      for (const item of state.textItems) {
        const page = pages[item.pageIndex];
        if (!page) continue;

        const hasTextChange = item.editedText !== item.originalText;
        const hasFmtChange  = item.format.bold || item.format.italic || item.format.underline ||
                              item.format.fontFamily !== 'helvetica' || item.format.fontSizeDelta !== 0 ||
                              item.format.color !== '#000000' || item.format.link !== '';
        const hasPosChange  = Math.abs(item.x - item.originalX) > 0.1 || Math.abs(item.y - item.originalY) > 0.1;
        const isDeleted     = !!item.isDeleted;
        const isAdded       = !!item.isAdded;

        if (!hasTextChange && !hasFmtChange && !hasPosChange && !isDeleted && !isAdded) continue;

        const pdfX_orig   = item.transform[4];
        const pdfY_orig   = item.transform[5];
        const pageHeight  = page.getHeight();

        // White-out original text area at its original coordinates (if not newly added)
        if (!isAdded) {
          const rectW = item.width  * pdfScale + 4;
          const rectH = item.height * pdfScale + 2;
          page.drawRectangle({
            x: pdfX_orig - 1,
            y: pdfY_orig - 1,
            width:  Math.max(rectW, 10),
            height: Math.max(rectH, 6),
            color:  rgb(1, 1, 1),
            opacity: 1,
          });
        }

        // If the item has been deleted, do not draw new text or link annotations
        if (isDeleted) continue;

        // Calculate new PDF baseline coordinates based on current layout item x/y
        const pdfX_new    = item.x * pdfScale;
        const pdfY_new    = pageHeight - ((item.y + item.height) * pdfScale);

        const fmt         = item.format;
        const pdfFontSize = Math.max((item.fontSize + fmt.fontSizeDelta) * pdfScale, 4);
        const textToDraw  = item.editedText;
        const { r, g, b } = hexToRgb01(fmt.color);

        const font = await getFont(resolveStdFont(fmt));

        // Draw new text at the new layout coordinates
        page.drawText(textToDraw, {
          x: pdfX_new,
          y: pdfY_new,
          size: pdfFontSize,
          font,
          color: rgb(r, g, b),
        });

        // Underline — draw a line below the text
        if (fmt.underline) {
          const textWidth = font.widthOfTextAtSize(textToDraw, pdfFontSize);
          page.drawLine({
            start: { x: pdfX_new, y: pdfY_new - 1 },
            end:   { x: pdfX_new + textWidth, y: pdfY_new - 1 },
            thickness: Math.max(pdfFontSize * 0.06, 0.5),
            color: rgb(r, g, b),
          });
        }

        // Link annotation
        if (fmt.link) {
          try {
            const annot = pdfLibDoc.context.register(
              pdfLibDoc.context.obj({
                Type:    'Annot',
                Subtype: 'Link',
                Rect:    [pdfX_new, pdfY_new - 2, pdfX_new + item.width * pdfScale, pdfY_new + pdfFontSize],
                Border:  [0, 0, 0],
                A: {
                  Type: 'Action',
                  S:    'URI',
                  URI:  fmt.link,
                },
              })
            );
            const existing = page.node.get(page.node.context.obj('Annots'));
            if (existing && 'push' in existing) {
              (existing as { push: (v: unknown) => void }).push(annot);
            } else {
              page.node.set(page.node.context.obj('Annots'), pdfLibDoc.context.obj([annot]));
            }
          } catch (_) { /* link annotation is best-effort */ }
        }
      }

      const pdfBytes = await pdfLibDoc.save();
      const blob  = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url   = URL.createObjectURL(blob);
      const a     = document.createElement('a');
      a.href      = url;
      a.download  = state.fileName.replace(/\.pdf$/i, '') + '_edited.pdf';
      a.click();
      URL.revokeObjectURL(url);

      setState(s => ({ ...s, isExporting: false }));
    } catch (err) {
      console.error(err);
      setState(s => ({ ...s, isExporting: false, error: 'Export failed. Please try again.' }));
    }
  }, [state]);

  const resetEditor = useCallback(() => {
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (_) { /* ignore */ }
      renderTaskRef.current = null;
    }
    pdfDocRef.current   = null;
    rawBytesRef.current = null;
    historyRef.current  = [];
    futureRef.current   = [];
    setState({
      fileName: '',
      totalPages: 0,
      currentPage: 1,
      scale: DEFAULT_SCALE,
      textItems: [],
      activeItemId: null,
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
    updateText,
    updateFormat,
    updatePosition,
    deleteItem,
    addTextField,
    undo,
    redo,
    setActiveItem,
    setCurrentPage,
    setScale,
    exportPDF,
    resetEditor,
  };
}
