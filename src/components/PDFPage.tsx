import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  GripVertical, Trash2, RotateCw
} from 'lucide-react';
import type {
  PDFTextItem, TextFormat, RedactionBox, EditorTool,
  PDFSignatureItem, PDFStampItem, SearchMatch
} from '../types/pdf';
import TextFormatToolbar from './TextFormatToolbar';

interface ActiveTextOverlayEditorProps {
  item: PDFTextItem;
  currentVal: string;
  itemX: number;
  pageWidth: number;
  initialCaretIndex: number;
  onItemTextChange: (id: string, text: string) => void;
  onItemBlur: (id: string) => void;
  updateFormat: (id: string, partial: Partial<TextFormat>) => void;
  deleteItem: (id: string) => void;
  handleDragPointerDown: (id: string, x: number, y: number, e: React.PointerEvent) => void;
}

function ActiveTextOverlayEditor({
  item,
  currentVal,
  itemX,
  pageWidth,
  initialCaretIndex,
  onItemTextChange,
  onItemBlur,
  updateFormat,
  deleteItem,
  handleDragPointerDown,
}: ActiveTextOverlayEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const availableWidth = Math.max(80, pageWidth - itemX - 16);

  // Auto-resize height as text wraps or grows vertically
  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(item.height, textarea.scrollHeight)}px`;
  }, [item.height]);

  useEffect(() => {
    autoResize();
  }, [currentVal, item.fontSize, item.format.fontSizeDelta, item.format.fontFamily, autoResize]);

  // Initial focus and caret placement strictly ONCE on mount
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const rId = requestAnimationFrame(() => {
      textarea.focus();
      textarea.scrollLeft = 0;
      textarea.scrollTop = 0;

      if (typeof initialCaretIndex === 'number' && initialCaretIndex >= 0) {
        const caretPos = Math.max(0, Math.min(currentVal.length, initialCaretIndex));
        try {
          textarea.setSelectionRange(caretPos, caretPos);
        } catch {
          // Fallback for environments without selection range support
        }
      }

      try {
        textarea.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } catch {
        // Fallback for headless testing
      }
    });

    return () => cancelAnimationFrame(rId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on initial activation mount

  return (
    <>
      <div
        className="drag-handle"
        onPointerDown={e => handleDragPointerDown(item.id, item.x, item.y, e)}
        style={{
          position: 'absolute',
          left: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          color: '#4d6bfa',
          zIndex: 100,
          touchAction: 'none',
        }}
        title="Drag to reposition text"
      >
        <GripVertical size={14} />
      </div>

      {(() => {
        const toolbarWidth = 380;
        const preferredLeftAbs = itemX + item.width / 2 - toolbarWidth / 2;
        const clampedLeftAbs = Math.max(10, Math.min(pageWidth - toolbarWidth - 10, preferredLeftAbs));
        const toolbarLeftRel = clampedLeftAbs - itemX;

        return (
          <TextFormatToolbar
            item={item}
            onUpdateFormat={updateFormat}
            onDelete={deleteItem}
            style={{
              left: `${toolbarLeftRel}px`,
              transform: 'none',
            }}
          />
        );
      })()}

      <textarea
        ref={textareaRef}
        className="text-overlay-input"
        value={currentVal}
        rows={1}
        style={{
          fontSize: item.fontSize + item.format.fontSizeDelta,
          fontWeight: item.format.bold ? 700 : 400,
          fontStyle: item.format.italic ? 'italic' : 'normal',
          textDecoration: item.format.underline ? 'underline' : 'none',
          fontFamily: item.format.fontFamily === 'times'
            ? 'Times New Roman, serif'
            : item.format.fontFamily === 'courier'
            ? 'Courier New, monospace'
            : 'Helvetica, Arial, sans-serif',
          color: item.format.color,
          width: '100%',
          maxWidth: `${availableWidth}px`,
          minWidth: `${Math.min(item.width, availableWidth)}px`,
        }}
        onClick={e => {
          // Prevent click from bubbling to parent container so the native caret remains where user clicked
          e.stopPropagation();
        }}
        onPointerDown={e => {
          e.stopPropagation();
        }}
        onChange={e => {
          onItemTextChange(item.id, e.target.value);
        }}
        onBlur={() => onItemBlur(item.id)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onItemBlur(item.id);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onItemBlur(item.id);
          }
        }}
      />
    </>
  );
}

interface PDFPageProps {
  pageNumber: number; // 1-indexed
  scale: number;
  pageDimension?: { width: number; height: number; rotation?: number };
  renderPage: (canvas: HTMLCanvasElement, pageNum: number, scale: number) => Promise<PDFTextItem[]>;
  cancelPageRender: (pageNum: number) => void;
  textItems: PDFTextItem[];
  redactions: RedactionBox[];
  signatures: PDFSignatureItem[];
  stamps: PDFStampItem[];
  activeItemId: string | null;
  activeRedactionId: string | null;
  activeSignatureId: string | null;
  activeStampId: string | null;
  activeTool: EditorTool;
  setActiveItem: (id: string | null) => void;
  setActiveRedaction: (id: string | null) => void;
  setActiveSignature: (id: string | null) => void;
  setActiveStamp: (id: string | null) => void;
  setActiveTool: (tool: EditorTool) => void;
  editValues: Record<string, string>;
  onItemTextChange: (id: string, text: string) => void;
  onItemBlur: (id: string) => void;
  onItemClick: (id: string, e: React.MouseEvent) => void;
  updateFormat: (id: string, partial: Partial<TextFormat>) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  deleteItem: (id: string) => void;
  addRedactionBox: (box: Omit<RedactionBox, 'id' | 'pageIndex'> & { pageIndex?: number }) => void;
  updateRedactionBox: (id: string, partial: Partial<RedactionBox>) => void;
  deleteRedactionBox: (id: string) => void;
  updateSignature: (id: string, partial: Partial<PDFSignatureItem>) => void;
  deleteSignature: (id: string) => void;
  updateStamp: (id: string, partial: Partial<PDFStampItem>) => void;
  deleteStamp: (id: string) => void;
  matches: SearchMatch[];
  currentMatchIndex: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function PDFPage({
  pageNumber,
  scale,
  pageDimension,
  renderPage,
  cancelPageRender,
  textItems,
  redactions,
  signatures,
  stamps,
  activeItemId,
  activeRedactionId,
  activeSignatureId,
  activeStampId,
  activeTool,
  setActiveItem,
  setActiveRedaction,
  setActiveSignature,
  setActiveStamp,
  setActiveTool: _setActiveTool,
  editValues,
  onItemTextChange,
  onItemBlur,
  onItemClick,
  updateFormat,
  updatePosition,
  deleteItem,
  addRedactionBox,
  updateRedactionBox,
  deleteRedactionBox,
  updateSignature,
  deleteSignature,
  updateStamp,
  deleteStamp,
  matches,
  currentMatchIndex,
  scrollContainerRef,
}: PDFPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Exact page dimensions to eliminate any layout shift
  const unscaledWidth = pageDimension?.width ?? 612;
  const unscaledHeight = pageDimension?.height ?? 792;
  const pageWidth = Math.round(unscaledWidth * scale);
  const pageHeight = Math.round(unscaledHeight * scale);

  // Virtualization visibility state
  const [isInViewport, setIsInViewport] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Initial caret position calculated on click
  const [initialCaretPos, setInitialCaretPos] = useState<number>(0);

  // Pointer Dragging State for Text
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(null);

  // Pointer Dragging / Resizing State for Redaction Boxes (Blackout & Whiteout)
  const [draggingRedactId, setDraggingRedactId] = useState<string | null>(null);
  const [dragRedactPosition, setDragRedactPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRedactStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(null);

  const [resizingRedactId, setResizingRedactId] = useState<string | null>(null);
  const [redactDimensions, setRedactDimensions] = useState<{ w: number; h: number } | null>(null);
  const resizeRedactStartRef = useRef<{ pointerX: number; pointerY: number; startW: number; startH: number } | null>(null);

  // Pointer Dragging / Resizing State for Signatures
  const [draggingSigId, setDraggingSigId] = useState<string | null>(null);
  const [dragSigPosition, setDragSigPosition] = useState<{ x: number; y: number } | null>(null);
  const dragSigStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(null);

  const [resizingSigId, setResizingSigId] = useState<string | null>(null);
  const [sigDimensions, setSigDimensions] = useState<{ w: number; h: number } | null>(null);
  const resizeSigStartRef = useRef<{ pointerX: number; pointerY: number; startW: number; startH: number; ratio: number } | null>(null);

  // Pointer Dragging / Resizing State for Stamps & Images
  const [draggingStampId, setDraggingStampId] = useState<string | null>(null);
  const [dragStampPosition, setDragStampPosition] = useState<{ x: number; y: number } | null>(null);
  const dragStampStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(null);

  const [resizingStampId, setResizingStampId] = useState<string | null>(null);
  const [stampDimensions, setStampDimensions] = useState<{ w: number; h: number } | null>(null);
  const resizeStampStartRef = useRef<{ pointerX: number; pointerY: number; startW: number; startH: number; ratio: number } | null>(null);

  // Drawing Redaction Box State
  const [isDrawingRedaction, setIsDrawingRedaction] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // 1. Intersection Observer for Preloading / Lazy Rendering
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      {
        root: scrollContainerRef.current || null,
        rootMargin: '800px 0px 800px 0px', // Preload buffer
        threshold: 0,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [scrollContainerRef]);

  // 2. Render Page Canvas when visible
  useEffect(() => {
    if (!isInViewport) {
      // Offscreen cleanup
      cancelPageRender(pageNumber);
      setIsRendered(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let isSubscribed = true;
    setRenderError(null);

    renderPage(canvas, pageNumber, scale)
      .then(() => {
        if (isSubscribed) {
          setIsRendered(true);
        }
      })
      .catch(err => {
        if (isSubscribed && err?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${pageNumber}:`, err);
          setRenderError('Failed to render page');
        }
      });

    return () => {
      isSubscribed = false;
      cancelPageRender(pageNumber);
    };
  }, [isInViewport, pageNumber, scale, renderPage, cancelPageRender]);

  // ── Drag Start Handlers with Pointer Capture ────────────────────────────────
  const handleDragPointerDown = useCallback((id: string, itemX: number, itemY: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setDraggingId(id);
    setDragPosition({ x: itemX, y: itemY });
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: itemX,
      startY: itemY,
    };
  }, []);

  const handleRedactDragStart = useCallback((id: string, boxX: number, boxY: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveRedaction(id);
    setActiveItem(null);
    setActiveSignature(null);
    setActiveStamp(null);

    setDraggingRedactId(id);
    setDragRedactPosition({ x: boxX, y: boxY });
    dragRedactStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: boxX,
      startY: boxY,
    };
  }, [setActiveRedaction, setActiveItem, setActiveSignature, setActiveStamp]);

  const handleRedactResizeStart = useCallback((id: string, w: number, h: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveRedaction(id);
    setActiveItem(null);
    setActiveSignature(null);
    setActiveStamp(null);

    setResizingRedactId(id);
    setRedactDimensions({ w, h });
    resizeRedactStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startW: w,
      startH: h,
    };
  }, [setActiveRedaction, setActiveItem, setActiveSignature, setActiveStamp]);

  const handleSigDragStart = useCallback((id: string, sigX: number, sigY: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveSignature(id);
    setActiveItem(null);
    setActiveRedaction(null);
    setActiveStamp(null);

    setDraggingSigId(id);
    setDragSigPosition({ x: sigX, y: sigY });
    dragSigStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: sigX,
      startY: sigY,
    };
  }, [setActiveSignature, setActiveItem, setActiveRedaction, setActiveStamp]);

  const handleSigResizeStart = useCallback((id: string, w: number, h: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveSignature(id);
    setActiveItem(null);
    setActiveRedaction(null);
    setActiveStamp(null);

    setResizingSigId(id);
    setSigDimensions({ w, h });
    resizeSigStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startW: w,
      startH: h,
      ratio: w / (h || 1),
    };
  }, [setActiveSignature, setActiveItem, setActiveRedaction, setActiveStamp]);

  const handleStampDragStart = useCallback((id: string, stampX: number, stampY: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveStamp(id);
    setActiveItem(null);
    setActiveRedaction(null);
    setActiveSignature(null);

    setDraggingStampId(id);
    setDragStampPosition({ x: stampX, y: stampY });
    dragStampStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: stampX,
      startY: stampY,
    };
  }, [setActiveStamp, setActiveItem, setActiveRedaction, setActiveSignature]);

  const handleStampResizeStart = useCallback((id: string, w: number, h: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveStamp(id);
    setActiveItem(null);
    setActiveRedaction(null);
    setActiveSignature(null);

    setResizingStampId(id);
    setStampDimensions({ w, h });
    resizeStampStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startW: w,
      startH: h,
      ratio: w / (h || 1),
    };
  }, [setActiveStamp, setActiveItem, setActiveRedaction, setActiveSignature]);

  // Pointer Move Listener for Active Page
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // 1. Dragging Text Item
    if (draggingId && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.pointerX;
      const dy = e.clientY - dragStartRef.current.pointerY;
      const newX = Math.max(0, Math.min(pageWidth - 20, dragStartRef.current.startX + dx));
      const newY = Math.max(0, Math.min(pageHeight - 20, dragStartRef.current.startY + dy));
      setDragPosition({ x: newX, y: newY });
    }

    // 2. Dragging Redaction Box
    if (draggingRedactId && dragRedactStartRef.current) {
      const dx = e.clientX - dragRedactStartRef.current.pointerX;
      const dy = e.clientY - dragRedactStartRef.current.pointerY;
      const newX = Math.max(0, Math.min(pageWidth - 20, dragRedactStartRef.current.startX + dx));
      const newY = Math.max(0, Math.min(pageHeight - 20, dragRedactStartRef.current.startY + dy));
      setDragRedactPosition({ x: newX, y: newY });
    }

    // 3. Resizing Redaction Box
    if (resizingRedactId && resizeRedactStartRef.current) {
      const dx = e.clientX - resizeRedactStartRef.current.pointerX;
      const dy = e.clientY - resizeRedactStartRef.current.pointerY;
      const newW = Math.max(15, resizeRedactStartRef.current.startW + dx);
      const newH = Math.max(10, resizeRedactStartRef.current.startH + dy);
      setRedactDimensions({ w: newW, h: newH });
    }

    // 4. Dragging Signature
    if (draggingSigId && dragSigStartRef.current) {
      const dx = e.clientX - dragSigStartRef.current.pointerX;
      const dy = e.clientY - dragSigStartRef.current.pointerY;
      const newX = Math.max(0, Math.min(pageWidth - 30, dragSigStartRef.current.startX + dx));
      const newY = Math.max(0, Math.min(pageHeight - 30, dragSigStartRef.current.startY + dy));
      setDragSigPosition({ x: newX, y: newY });
    }

    // 5. Resizing Signature (Aspect ratio locked)
    if (resizingSigId && resizeSigStartRef.current) {
      const dx = e.clientX - resizeSigStartRef.current.pointerX;
      const newW = Math.max(40, resizeSigStartRef.current.startW + dx);
      const newH = Math.max(20, newW / resizeSigStartRef.current.ratio);
      setSigDimensions({ w: newW, h: newH });
    }

    // 6. Dragging Stamp
    if (draggingStampId && dragStampStartRef.current) {
      const dx = e.clientX - dragStampStartRef.current.pointerX;
      const dy = e.clientY - dragStampStartRef.current.pointerY;
      const newX = Math.max(0, Math.min(pageWidth - 30, dragStampStartRef.current.startX + dx));
      const newY = Math.max(0, Math.min(pageHeight - 30, dragStampStartRef.current.startY + dy));
      setDragStampPosition({ x: newX, y: newY });
    }

    // 7. Resizing Stamp
    if (resizingStampId && resizeStampStartRef.current) {
      const dx = e.clientX - resizeStampStartRef.current.pointerX;
      const newW = Math.max(30, resizeStampStartRef.current.startW + dx);
      const newH = Math.max(20, newW / resizeStampStartRef.current.ratio);
      setStampDimensions({ w: newW, h: newH });
    }
  }, [draggingId, draggingRedactId, resizingRedactId, draggingSigId, resizingSigId, draggingStampId, resizingStampId, pageWidth, pageHeight]);

  // Pointer Up Listener for Active Page
  const handlePointerUp = useCallback(() => {
    // 1. Commit Dragged Text
    if (draggingId && dragPosition) {
      updatePosition(draggingId, dragPosition.x, dragPosition.y);
      setDraggingId(null);
      setDragPosition(null);
      dragStartRef.current = null;
    }

    // 2. Commit Dragged Redaction Box
    if (draggingRedactId && dragRedactPosition) {
      updateRedactionBox(draggingRedactId, {
        x: dragRedactPosition.x,
        y: dragRedactPosition.y,
      });
      setDraggingRedactId(null);
      setDragRedactPosition(null);
      dragRedactStartRef.current = null;
    }

    // 3. Commit Resized Redaction Box
    if (resizingRedactId && redactDimensions) {
      updateRedactionBox(resizingRedactId, {
        width: redactDimensions.w,
        height: redactDimensions.h,
      });
      setResizingRedactId(null);
      setRedactDimensions(null);
      resizeRedactStartRef.current = null;
    }

    // 4. Commit Dragged Signature
    if (draggingSigId && dragSigPosition) {
      updateSignature(draggingSigId, {
        x: dragSigPosition.x,
        y: dragSigPosition.y,
      });
      setDraggingSigId(null);
      setDragSigPosition(null);
      dragSigStartRef.current = null;
    }

    // 5. Commit Resized Signature
    if (resizingSigId && sigDimensions) {
      updateSignature(resizingSigId, {
        width: sigDimensions.w,
        height: sigDimensions.h,
      });
      setResizingSigId(null);
      setSigDimensions(null);
      resizeSigStartRef.current = null;
    }

    // 6. Commit Dragged Stamp
    if (draggingStampId && dragStampPosition) {
      updateStamp(draggingStampId, {
        x: dragStampPosition.x,
        y: dragStampPosition.y,
      });
      setDraggingStampId(null);
      setDragStampPosition(null);
      dragStampStartRef.current = null;
    }

    // 7. Commit Resized Stamp
    if (resizingStampId && stampDimensions) {
      updateStamp(resizingStampId, {
        width: stampDimensions.w,
        height: stampDimensions.h,
      });
      setResizingStampId(null);
      setStampDimensions(null);
      resizeStampStartRef.current = null;
    }
  }, [
    draggingId, dragPosition, updatePosition,
    draggingRedactId, dragRedactPosition, updateRedactionBox,
    resizingRedactId, redactDimensions,
    draggingSigId, dragSigPosition, updateSignature,
    resizingSigId, sigDimensions,
    draggingStampId, dragStampPosition, updateStamp,
    resizingStampId, stampDimensions
  ]);

  // Handle Text Click with Character Index Calculation
  const handleTextItemClick = useCallback((id: string, e: React.MouseEvent) => {
    // If the clicked item is already active, don't interfere with the user's cursor
    if (activeItemId === id) {
      return;
    }

    let clickedOffset: number | null = null;

    // Use native browser caret offset detection from click point if supported
    if (typeof (document as any).caretPositionFromPoint === 'function') {
      try {
        const pos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
        if (pos && typeof pos.offset === 'number') {
          clickedOffset = pos.offset;
        }
      } catch {
        // Fallback below
      }
    } else if (typeof (document as any).caretRangeFromPoint === 'function') {
      try {
        const range = (document as any).caretRangeFromPoint(e.clientX, e.clientY);
        if (range && typeof range.startOffset === 'number') {
          clickedOffset = range.startOffset;
        }
      } catch {
        // Fallback below
      }
    }

    // Fallback: estimate proportional click position
    if (clickedOffset === null || isNaN(clickedOffset)) {
      const targetEl = e.currentTarget as HTMLElement;
      const rect = targetEl.getBoundingClientRect();
      const clickOffsetX = Math.max(0, e.clientX - rect.left);
      const charRatio = Math.max(0, Math.min(1, clickOffsetX / (rect.width || 1)));
      const itemVal = editValues[id] ?? textItems.find(it => it.id === id)?.editedText ?? '';
      clickedOffset = Math.round(charRatio * itemVal.length);
    }

    setInitialCaretPos(clickedOffset);
    onItemClick(id, e);
  }, [activeItemId, editValues, textItems, onItemClick]);

  // ── Pointer Drawing for Redactions (Blackout & Whiteout) ────────────────────
  const handlePagePointerDown = (e: React.PointerEvent) => {
    if (activeTool !== 'blackout' && activeTool !== 'whiteout') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const x = Math.max(0, Math.min(pageWidth, e.clientX - rect.left));
    const y = Math.max(0, Math.min(pageHeight, e.clientY - rect.top));

    setIsDrawingRedaction(true);
    setDrawStart({ x, y });
    setCurrentRect({ x, y, w: 0, h: 0 });
  };

  const handlePagePointerMove = (e: React.PointerEvent) => {
    if (isDrawingRedaction && drawStart && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = Math.max(0, Math.min(pageWidth, e.clientX - rect.left));
      const currentY = Math.max(0, Math.min(pageHeight, e.clientY - rect.top));

      const x = Math.min(drawStart.x, currentX);
      const y = Math.min(drawStart.y, currentY);
      const w = Math.abs(currentX - drawStart.x);
      const h = Math.abs(currentY - drawStart.y);

      setCurrentRect({ x, y, w, h });
      return;
    }

    handlePointerMove(e);
  };

  const handlePagePointerUp = () => {
    if (isDrawingRedaction && currentRect) {
      if (currentRect.w > 4 && currentRect.h > 4) {
        addRedactionBox({
          x: currentRect.x,
          y: currentRect.y,
          width: currentRect.w,
          height: currentRect.h,
          type: activeTool === 'whiteout' ? 'whiteout' : 'blackout',
          pageIndex: pageNumber,
        });
      }

      setIsDrawingRedaction(false);
      setDrawStart(null);
      setCurrentRect(null);
      return;
    }

    handlePointerUp();
  };

  // Find & Replace matches on this page
  const pageMatches = useMemo(() => {
    return matches.filter(m => m.pageNumber === pageNumber);
  }, [matches, pageNumber]);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      className="pdf-page-container"
      style={{
        width: pageWidth,
        minWidth: pageWidth,
        height: pageHeight,
        minHeight: pageHeight,
        position: 'relative',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        borderRadius: 4,
        background: '#ffffff',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: activeTool === 'blackout' || activeTool === 'whiteout' ? 'none' : 'pan-y',
        cursor: activeTool === 'blackout' || activeTool === 'whiteout' ? 'crosshair' : 'default',
      }}
      onPointerDown={handlePagePointerDown}
      onPointerMove={handlePagePointerMove}
      onPointerUp={handlePagePointerUp}
      onPointerCancel={handlePagePointerUp}
    >
      {/* 1. Underlying PDF.js Rendered Canvas */}
      {isInViewport && (
        <canvas
          ref={canvasRef}
          style={{
            display: isRendered ? 'block' : 'none',
            width: pageWidth,
            height: pageHeight,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 2. Loading Placeholder / Skeleton while offscreen or rendering */}
      {(!isInViewport || !isRendered) && !renderError && (
        <div
          className="pdf-page-placeholder"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #181826 0%, #12121c 100%)',
            color: 'rgba(240,240,240,0.4)',
            fontSize: '0.875rem',
            gap: '0.75rem',
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            border: '2px solid rgba(77,107,250,0.3)',
            borderTopColor: '#4d6bfa',
            borderRadius: '50%',
            animation: 'spin-slow 0.8s linear infinite',
          }} />
          <span>Page {pageNumber}</span>
        </div>
      )}

      {/* 3. Render Error notice */}
      {renderError && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(239,68,68,0.1)',
          color: '#fca5a5',
          fontSize: '0.875rem',
        }}>
          {renderError}
        </div>
      )}

      {/* 4. Whiteout Cover-ups for Moved / Deleted Text */}
      {textItems.map(item => {
        const isMoved = Math.abs(item.x - item.originalX) > 0.5 || Math.abs(item.y - item.originalY) > 0.5;
        const currentVal = editValues[item.id] ?? item.editedText;
        const isEdited = currentVal !== item.originalText;
        const shouldCover = (item.isDeleted || isMoved || isEdited) && !item.isAdded;

        if (!shouldCover) return null;

        return (
          <div
            key={`cover-${item.id}`}
            style={{
              position: 'absolute',
              left: item.originalX - 1,
              top: item.originalY - 1,
              width: item.width + 3,
              height: item.height + 2,
              backgroundColor: '#ffffff',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        );
      })}

      {/* 5. Permanent Blackout and Whiteout Redaction Boxes */}
      {redactions.map(box => {
        const isSelected = activeRedactionId === box.id;
        const isBeingDragged = draggingRedactId === box.id;
        const isBeingResized = resizingRedactId === box.id;

        const currentX = isBeingDragged && dragRedactPosition ? dragRedactPosition.x : box.x;
        const currentY = isBeingDragged && dragRedactPosition ? dragRedactPosition.y : box.y;
        const currentW = isBeingResized && redactDimensions ? redactDimensions.w : box.width;
        const currentH = isBeingResized && redactDimensions ? redactDimensions.h : box.height;

        return (
          <div
            key={box.id}
            onPointerDown={e => handleRedactDragStart(box.id, box.x, box.y, e)}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              width: currentW,
              height: currentH,
              backgroundColor: box.type === 'whiteout' ? '#ffffff' : '#000000',
              border: isSelected ? '2px solid #4d6bfa' : box.type === 'whiteout' ? '1px dashed #cbd5e1' : 'none',
              cursor: 'move',
              zIndex: 20,
              boxShadow: isSelected ? '0 0 0 3px rgba(77,107,250,0.3)' : 'none',
              boxSizing: 'border-box',
              touchAction: 'none',
            }}
            onClick={e => {
              e.stopPropagation();
              setActiveRedaction(box.id);
              setActiveItem(null);
              setActiveSignature(null);
              setActiveStamp(null);
            }}
          >
            {isSelected && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteRedactionBox(box.id);
                    setActiveRedaction(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: -12,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid #fff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 30,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    padding: 0,
                  }}
                  title="Delete redaction box (Delete / Backspace)"
                >
                  <Trash2 size={11} />
                </button>

                <div
                  onPointerDown={e => handleRedactResizeStart(box.id, box.width, box.height, e)}
                  style={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#4d6bfa',
                    border: '2px solid #fff',
                    cursor: 'nwse-resize',
                    zIndex: 30,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    touchAction: 'none',
                  }}
                  title="Drag to resize redaction box"
                />
              </>
            )}
          </div>
        );
      })}

      {/* 6. Digital Signatures */}
      {signatures.map(sig => {
        const isSelected = activeSignatureId === sig.id;
        const isBeingDragged = draggingSigId === sig.id;
        const isBeingResized = resizingSigId === sig.id;

        const currentX = isBeingDragged && dragSigPosition ? dragSigPosition.x : sig.x;
        const currentY = isBeingDragged && dragSigPosition ? dragSigPosition.y : sig.y;
        const currentW = isBeingResized && sigDimensions ? sigDimensions.w : sig.width;
        const currentH = isBeingResized && sigDimensions ? sigDimensions.h : sig.height;

        return (
          <div
            key={sig.id}
            onPointerDown={e => handleSigDragStart(sig.id, sig.x, sig.y, e)}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              width: currentW,
              height: currentH,
              cursor: 'move',
              zIndex: 22,
              border: isSelected ? '2px solid #4d6bfa' : '1px dashed transparent',
              boxShadow: isSelected ? '0 0 0 3px rgba(77,107,250,0.3)' : 'none',
              boxSizing: 'border-box',
              touchAction: 'none',
            }}
            onClick={e => {
              e.stopPropagation();
              setActiveSignature(sig.id);
              setActiveItem(null);
              setActiveRedaction(null);
              setActiveStamp(null);
            }}
          >
            <img
              src={sig.dataUrl}
              alt="Digital Signature"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              draggable={false}
            />

            {isSelected && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteSignature(sig.id);
                    setActiveSignature(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: -12,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid #fff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 30,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    padding: 0,
                  }}
                  title="Delete signature"
                >
                  <Trash2 size={11} />
                </button>

                <div
                  onPointerDown={e => handleSigResizeStart(sig.id, sig.width, sig.height, e)}
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    right: -6,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#4d6bfa',
                    border: '2px solid #fff',
                    cursor: 'nwse-resize',
                    zIndex: 30,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    touchAction: 'none',
                  }}
                  title="Drag to resize signature"
                />
              </>
            )}
          </div>
        );
      })}

      {/* 7. Official Stamps & Custom Images */}
      {stamps.map(stamp => {
        const isSelected = activeStampId === stamp.id;
        const isBeingDragged = draggingStampId === stamp.id;
        const isBeingResized = resizingStampId === stamp.id;

        const currentX = isBeingDragged && dragStampPosition ? dragStampPosition.x : stamp.x;
        const currentY = isBeingDragged && dragStampPosition ? dragStampPosition.y : stamp.y;
        const currentW = isBeingResized && stampDimensions ? stampDimensions.w : stamp.width;
        const currentH = isBeingResized && stampDimensions ? stampDimensions.h : stamp.height;

        return (
          <div
            key={stamp.id}
            onPointerDown={e => handleStampDragStart(stamp.id, stamp.x, stamp.y, e)}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              width: currentW,
              height: currentH,
              cursor: 'move',
              zIndex: 22,
              border: isSelected ? '2px solid #4ade80' : '1px dashed transparent',
              boxShadow: isSelected ? '0 0 0 3px rgba(74,222,128,0.3)' : 'none',
              boxSizing: 'border-box',
              opacity: stamp.opacity,
              transform: `rotate(${stamp.rotation}deg)`,
              transformOrigin: 'center center',
              touchAction: 'none',
            }}
            onClick={e => {
              e.stopPropagation();
              setActiveStamp(stamp.id);
              setActiveItem(null);
              setActiveRedaction(null);
              setActiveSignature(null);
            }}
          >
            <img
              src={stamp.dataUrl}
              alt={stamp.label || 'PDF Stamp'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              draggable={false}
            />

            {isSelected && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteStamp(stamp.id);
                  setActiveStamp(null);
                }}
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid #fff',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 30,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  padding: 0,
                }}
                title="Delete stamp"
              >
                <Trash2 size={11} />
              </button>
            )}

            {isSelected && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  const nextAngle = ((stamp.rotation + 45) % 360);
                  updateStamp(stamp.id, { rotation: nextAngle });
                }}
                style={{
                  position: 'absolute',
                  top: -12,
                  left: -12,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#4d6bfa',
                  border: '2px solid #fff',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 30,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  padding: 0,
                }}
                title="Click to cycle rotation angle"
              >
                <RotateCw size={12} />
              </button>
            )}

            {isSelected && (
              <div
                onPointerDown={e => handleStampResizeStart(stamp.id, stamp.width, stamp.height, e)}
                style={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#4ade80',
                  border: '2px solid #fff',
                  cursor: 'nwse-resize',
                  zIndex: 30,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  touchAction: 'none',
                }}
                title="Drag to resize stamp"
              />
            )}
          </div>
        );
      })}

      {/* 8. In-progress Dragging Redaction Box Preview */}
      {isDrawingRedaction && currentRect && (
        <div
          style={{
            position: 'absolute',
            left: currentRect.x,
            top: currentRect.y,
            width: currentRect.w,
            height: currentRect.h,
            background: activeTool === 'blackout' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
            border: `2px dashed ${activeTool === 'blackout' ? '#ef4444' : '#4d6bfa'}`,
            zIndex: 25,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 9. Text Overlays */}
      {textItems.filter(item => !item.isDeleted).map(item => {
        const isActive = activeItemId === item.id;
        const currentVal = editValues[item.id] ?? item.editedText;
        const isEdited = currentVal !== item.originalText;
        const isFormatted = item.format.bold ||
                            item.format.italic ||
                            item.format.underline ||
                            item.format.fontFamily !== 'helvetica' ||
                            item.format.fontSizeDelta !== 0 ||
                            item.format.color !== '#000000' ||
                            item.format.link !== '';
        const hasPosChange = Math.abs(item.x - item.originalX) > 0.5 || Math.abs(item.y - item.originalY) > 0.5;
        const hasChanges = isEdited || isFormatted || hasPosChange || !!item.isAdded;

        const isCurrentDragging = draggingId === item.id;
        const itemX = isCurrentDragging && dragPosition ? dragPosition.x : item.x;
        const itemY = isCurrentDragging && dragPosition ? dragPosition.y : item.y;

        // Find & Replace match highlight check
        const isMatch = pageMatches.some(m => m.itemId === item.id);
        const currentMatch = matches[currentMatchIndex];
        const isCurrentMatch = currentMatch?.itemId === item.id && currentMatch?.pageNumber === pageNumber;

        // Constrain available width on page to guarantee zero horizontal layout shift / overflow
        const availableWidth = Math.max(80, pageWidth - itemX - 16);
        const activeContainerWidth = Math.min(Math.max(item.width, 80), availableWidth);

        return (
          <div
            key={item.id}
            className={`text-overlay-item${isActive ? ' active' : ''}`}
            style={{
              left: itemX,
              top: itemY,
              minWidth: isActive ? `${activeContainerWidth}px` : `${item.width}px`,
              maxWidth: isActive ? `${availableWidth}px` : undefined,
              width: isActive ? `${activeContainerWidth}px` : (hasChanges ? 'max-content' : `${item.width}px`),
              minHeight: item.height,
              height: isActive ? 'auto' : item.height,
              fontSize: item.fontSize + item.format.fontSizeDelta,
              lineHeight: 1.2,
              background: isActive
                ? '#ffffff'
                : isCurrentMatch
                ? 'rgba(254,240,138,0.5)'
                : isMatch
                ? 'rgba(254,240,138,0.25)'
                : (hasChanges && !item.isAdded ? '#ffffff' : undefined),
              boxShadow: isCurrentMatch
                ? '0 0 0 2px #f59e0b, 0 0 12px rgba(245,158,11,0.6)'
                : isMatch
                ? '0 0 0 1px #eab308'
                : undefined,
              borderColor: !isActive && hasChanges ? 'rgba(77, 107, 250, 0.5)' : undefined,
              overflow: 'visible',
              zIndex: isCurrentMatch ? 12 : hasChanges || isActive ? 10 : 1,
            }}
            onClick={e => handleTextItemClick(item.id, e)}
            title={hasChanges ? `Edited — click to re-edit` : 'Click to edit'}
          >
            {isActive ? (
              <ActiveTextOverlayEditor
                item={item}
                currentVal={currentVal}
                itemX={itemX}
                pageWidth={pageWidth}
                initialCaretIndex={initialCaretPos}
                onItemTextChange={onItemTextChange}
                onItemBlur={onItemBlur}
                updateFormat={updateFormat}
                deleteItem={deleteItem}
                handleDragPointerDown={handleDragPointerDown}
              />
            ) : (
              <span
                style={{
                  display: 'inline-block',
                  padding: '1px 3px',
                  boxSizing: 'border-box',
                  fontSize: item.fontSize + item.format.fontSizeDelta,
                  fontWeight: item.format.bold ? 700 : 400,
                  fontStyle: item.format.italic ? 'italic' : 'normal',
                  textDecoration: item.format.underline ? 'underline' : 'none',
                  fontFamily: item.format.fontFamily === 'times'
                    ? 'Times New Roman, serif'
                    : item.format.fontFamily === 'courier'
                    ? 'Courier New, monospace'
                    : 'Helvetica, Arial, sans-serif',
                  color: hasChanges ? item.format.color : 'transparent',
                  cursor: 'text',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentVal}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
