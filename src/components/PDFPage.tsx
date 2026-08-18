import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  GripVertical, Trash2, RotateCw
} from 'lucide-react';
import type {
  PDFTextItem, TextFormat, RedactionBox, EditorTool,
  PDFSignatureItem, PDFStampItem, SearchMatch
} from '../types/pdf';
import TextFormatToolbar from './TextFormatToolbar';

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
    e.preventDefault();
    e.stopPropagation();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    setDraggingId(id);
    setDragPosition({ x: itemX, y: itemY });
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: itemX,
      startY: itemY,
    };
  }, []);

  const handleRedactionDragStart = useCallback((id: string, boxX: number, boxY: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
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
  }, [setActiveItem, setActiveRedaction, setActiveSignature, setActiveStamp]);

  const handleRedactionResizeStart = useCallback((id: string, w: number, h: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    setActiveRedaction(id);
    setResizingRedactId(id);
    setRedactDimensions({ w, h });
    resizeRedactStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startW: w,
      startH: h,
    };
  }, [setActiveRedaction]);

  const handleSignatureDragStart = useCallback((id: string, sigX: number, sigY: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
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
  }, [setActiveItem, setActiveRedaction, setActiveSignature, setActiveStamp]);

  const handleSignatureResizeStart = useCallback((id: string, w: number, h: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    setActiveSignature(id);
    setResizingSigId(id);
    setSigDimensions({ w, h });
    resizeSigStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startW: w,
      startH: h,
      ratio: w / h,
    };
  }, [setActiveSignature]);

  const handleStampDragStart = useCallback((id: string, stampX: number, stampY: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
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
  }, [setActiveItem, setActiveRedaction, setActiveSignature, setActiveStamp]);

  const handleStampResizeStart = useCallback((id: string, w: number, h: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    setActiveStamp(id);
    setResizingStampId(id);
    setStampDimensions({ w, h });
    resizeStampStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startW: w,
      startH: h,
      ratio: w / h,
    };
  }, [setActiveStamp]);

  // ── Global Pointer Event Listeners for Page Drag Operations ─────────────────
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // 1. Text item dragging
      if (draggingId && dragStartRef.current) {
        const start = dragStartRef.current;
        const deltaX = e.clientX - start.pointerX;
        const deltaY = e.clientY - start.pointerY;
        const item = textItems.find(i => i.id === draggingId);
        if (item) {
          const newX = Math.max(0, Math.min(pageWidth - item.width, start.startX + deltaX));
          const newY = Math.max(0, Math.min(pageHeight - item.height, start.startY + deltaY));
          setDragPosition({ x: newX, y: newY });
        }
      }

      // 2. Redaction box dragging
      if (draggingRedactId && dragRedactStartRef.current) {
        const start = dragRedactStartRef.current;
        const deltaX = e.clientX - start.pointerX;
        const deltaY = e.clientY - start.pointerY;
        const box = redactions.find(b => b.id === draggingRedactId);
        if (box) {
          const newX = Math.max(0, Math.min(pageWidth - box.width, start.startX + deltaX));
          const newY = Math.max(0, Math.min(pageHeight - box.height, start.startY + deltaY));
          setDragRedactPosition({ x: newX, y: newY });
        }
      }

      // 3. Redaction box resizing
      if (resizingRedactId && resizeRedactStartRef.current) {
        const start = resizeRedactStartRef.current;
        const deltaX = e.clientX - start.pointerX;
        const deltaY = e.clientY - start.pointerY;
        const newW = Math.max(10, Math.min(pageWidth, start.startW + deltaX));
        const newH = Math.max(8, Math.min(pageHeight, start.startH + deltaY));
        setRedactDimensions({ w: newW, h: newH });
      }

      // 4. Signature dragging
      if (draggingSigId && dragSigStartRef.current) {
        const start = dragSigStartRef.current;
        const deltaX = e.clientX - start.pointerX;
        const deltaY = e.clientY - start.pointerY;
        const sig = signatures.find(s => s.id === draggingSigId);
        if (sig) {
          const newX = Math.max(0, Math.min(pageWidth - sig.width, start.startX + deltaX));
          const newY = Math.max(0, Math.min(pageHeight - sig.height, start.startY + deltaY));
          setDragSigPosition({ x: newX, y: newY });
        }
      }

      // 5. Signature resizing (aspect ratio locked)
      if (resizingSigId && resizeSigStartRef.current) {
        const start = resizeSigStartRef.current;
        const deltaX = e.clientX - start.pointerX;
        const newW = Math.max(20, Math.min(pageWidth, start.startW + deltaX));
        const newH = Math.max(10, Math.round(newW / start.ratio));
        setSigDimensions({ w: newW, h: newH });
      }

      // 6. Stamp dragging
      if (draggingStampId && dragStampStartRef.current) {
        const start = dragStampStartRef.current;
        const deltaX = e.clientX - start.pointerX;
        const deltaY = e.clientY - start.pointerY;
        const stamp = stamps.find(st => st.id === draggingStampId);
        if (stamp) {
          const newX = Math.max(0, Math.min(pageWidth - stamp.width, start.startX + deltaX));
          const newY = Math.max(0, Math.min(pageHeight - stamp.height, start.startY + deltaY));
          setDragStampPosition({ x: newX, y: newY });
        }
      }

      // 7. Stamp resizing
      if (resizingStampId && resizeStampStartRef.current) {
        const start = resizeStampStartRef.current;
        const deltaX = e.clientX - start.pointerX;
        const newW = Math.max(20, Math.min(pageWidth, start.startW + deltaX));
        const newH = Math.max(10, Math.round(newW / start.ratio));
        setStampDimensions({ w: newW, h: newH });
      }
    };

    const handlePointerUp = () => {
      if (draggingId && dragPosition) {
        updatePosition(draggingId, dragPosition.x, dragPosition.y);
      }
      if (draggingRedactId && dragRedactPosition) {
        updateRedactionBox(draggingRedactId, { x: dragRedactPosition.x, y: dragRedactPosition.y });
      }
      if (resizingRedactId && redactDimensions) {
        updateRedactionBox(resizingRedactId, { width: redactDimensions.w, height: redactDimensions.h });
      }
      if (draggingSigId && dragSigPosition) {
        updateSignature(draggingSigId, { x: dragSigPosition.x, y: dragSigPosition.y });
      }
      if (resizingSigId && sigDimensions) {
        updateSignature(resizingSigId, { width: sigDimensions.w, height: sigDimensions.h });
      }
      if (draggingStampId && dragStampPosition) {
        updateStamp(draggingStampId, { x: dragStampPosition.x, y: dragStampPosition.y });
      }
      if (resizingStampId && stampDimensions) {
        updateStamp(resizingStampId, { width: stampDimensions.w, height: stampDimensions.h });
      }

      setDraggingId(null);
      setDragPosition(null);
      dragStartRef.current = null;

      setDraggingRedactId(null);
      setDragRedactPosition(null);
      dragRedactStartRef.current = null;

      setResizingRedactId(null);
      setRedactDimensions(null);
      resizeRedactStartRef.current = null;

      setDraggingSigId(null);
      setDragSigPosition(null);
      dragSigStartRef.current = null;

      setResizingSigId(null);
      setSigDimensions(null);
      resizeSigStartRef.current = null;

      setDraggingStampId(null);
      setDragStampPosition(null);
      dragStampStartRef.current = null;

      setResizingStampId(null);
      setStampDimensions(null);
      resizeStampStartRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [
    draggingId, dragPosition, textItems, updatePosition, pageWidth, pageHeight,
    draggingRedactId, dragRedactPosition, resizingRedactId, redactDimensions, redactions, updateRedactionBox,
    draggingSigId, dragSigPosition, resizingSigId, sigDimensions, signatures, updateSignature,
    draggingStampId, dragStampPosition, resizingStampId, stampDimensions, stamps, updateStamp,
  ]);

  // ── Drawing Redactions on this Page ─────────────────────────────────────────
  const handlePagePointerDown = (e: React.PointerEvent) => {
    if (activeTool !== 'blackout' && activeTool !== 'whiteout') {
      if (activeTool === 'select') {
        setActiveItem(null);
        setActiveRedaction(null);
        setActiveSignature(null);
        setActiveStamp(null);
      }
      return;
    }

    const wrapper = containerRef.current;
    if (!wrapper) return;

    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    const rect = wrapper.getBoundingClientRect();
    const x = Math.max(0, Math.min(pageWidth, e.clientX - rect.left));
    const y = Math.max(0, Math.min(pageHeight, e.clientY - rect.top));

    setIsDrawingRedaction(true);
    setDrawStart({ x, y });
    setCurrentRect({ x, y, w: 0, h: 0 });
  };

  const handlePagePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRedaction || !drawStart) return;

    const wrapper = containerRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(pageWidth, e.clientX - rect.left));
    const currentY = Math.max(0, Math.min(pageHeight, e.clientY - rect.top));

    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const w = Math.abs(currentX - drawStart.x);
    const h = Math.abs(currentY - drawStart.y);

    setCurrentRect({ x, y, w, h });
  };

  const handlePagePointerUp = () => {
    if (!isDrawingRedaction || !currentRect) {
      setIsDrawingRedaction(false);
      setDrawStart(null);
      setCurrentRect(null);
      return;
    }

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
          <span style={{ fontWeight: 600 }}>Page {pageNumber}</span>
        </div>
      )}

      {/* 3. Error Fallback */}
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

      {/* 4. White cover-up boxes for deleted or moved text items */}
      {textItems.map(item => {
        if (item.isAdded) return null;
        const hasPosChange = Math.abs(item.x - item.originalX) > 0.5 || Math.abs(item.y - item.originalY) > 0.5;
        const isDeleted = !!item.isDeleted;
        if (!isDeleted && !hasPosChange) return null;

        return (
          <div
            key={`cover-${item.id}`}
            style={{
              position: 'absolute',
              left: item.originalX - 1,
              top: item.originalY - 1,
              width: item.width + 2,
              height: item.height + 2,
              background: '#ffffff',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        );
      })}

      {/* 5. Redaction Boxes (Blackout & Whiteout) */}
      {redactions.map(box => {
        const isSelected = activeRedactionId === box.id;
        const isCurrentDragging = draggingRedactId === box.id;
        const boxX = isCurrentDragging && dragRedactPosition ? dragRedactPosition.x : box.x;
        const boxY = isCurrentDragging && dragRedactPosition ? dragRedactPosition.y : box.y;

        const isCurrentResizing = resizingRedactId === box.id;
        const boxW = isCurrentResizing && redactDimensions ? redactDimensions.w : box.width;
        const boxH = isCurrentResizing && redactDimensions ? redactDimensions.h : box.height;

        return (
          <div
            key={box.id}
            onPointerDown={e => {
              e.stopPropagation();
              handleRedactionDragStart(box.id, box.x, box.y, e);
            }}
            onClick={e => {
              e.stopPropagation();
              setActiveItem(null);
              setActiveSignature(null);
              setActiveStamp(null);
              setActiveRedaction(box.id);
            }}
            style={{
              position: 'absolute',
              left: boxX,
              top: boxY,
              width: boxW,
              height: boxH,
              background: box.type === 'blackout' ? '#000000' : '#ffffff',
              border: isSelected
                ? '2px solid #ef4444'
                : box.type === 'whiteout'
                ? '1px dashed rgba(77,107,250,0.5)'
                : '1px solid rgba(255,255,255,0.2)',
              boxShadow: isSelected ? '0 0 10px rgba(239,68,68,0.6)' : 'none',
              zIndex: 15,
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            {isSelected && (
              <button
                onPointerDown={e => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  deleteRedactionBox(box.id);
                  setActiveRedaction(null);
                }}
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                  zIndex: 30,
                }}
                title={`Delete ${box.type === 'blackout' ? 'Blackout' : 'Whiteout'} Redaction`}
              >
                <Trash2 size={12} />
              </button>
            )}

            {isSelected && (
              <div
                onPointerDown={e => {
                  e.stopPropagation();
                  handleRedactionResizeStart(box.id, box.width, box.height, e);
                }}
                style={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: box.type === 'blackout' ? '#ef4444' : '#4d6bfa',
                  border: '2px solid #fff',
                  cursor: 'nwse-resize',
                  zIndex: 30,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  touchAction: 'none',
                }}
                title="Drag to resize redaction area"
              />
            )}
          </div>
        );
      })}

      {/* 6. Digital Signatures */}
      {signatures.map(sig => {
        const isSelected = activeSignatureId === sig.id;
        const isCurrentDragging = draggingSigId === sig.id;
        const sigX = isCurrentDragging && dragSigPosition ? dragSigPosition.x : sig.x;
        const sigY = isCurrentDragging && dragSigPosition ? dragSigPosition.y : sig.y;

        const isCurrentResizing = resizingSigId === sig.id;
        const sigW = isCurrentResizing && sigDimensions ? sigDimensions.w : sig.width;
        const sigH = isCurrentResizing && sigDimensions ? sigDimensions.h : sig.height;

        return (
          <div
            key={sig.id}
            onClick={e => {
              e.stopPropagation();
              setActiveItem(null);
              setActiveRedaction(null);
              setActiveStamp(null);
              setActiveSignature(sig.id);
            }}
            onPointerDown={e => handleSignatureDragStart(sig.id, sig.x, sig.y, e)}
            style={{
              position: 'absolute',
              left: sigX,
              top: sigY,
              width: sigW,
              height: sigH,
              border: isSelected ? '2px dashed #4d6bfa' : '1px solid transparent',
              borderRadius: 4,
              boxShadow: isSelected ? '0 0 10px rgba(77,107,250,0.4)' : 'none',
              zIndex: 20,
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'none',
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
            />

            {isSelected && (
              <button
                onPointerDown={e => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  deleteSignature(sig.id);
                  setActiveSignature(null);
                }}
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  zIndex: 30,
                }}
                title="Remove signature"
              >
                <Trash2 size={12} />
              </button>
            )}

            {isSelected && (
              <div
                onPointerDown={e => handleSignatureResizeStart(sig.id, sig.width, sig.height, e)}
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
            )}
          </div>
        );
      })}

      {/* 7. Official Stamps & Custom Images */}
      {stamps.map(stamp => {
        const isSelected = activeStampId === stamp.id;
        const isCurrentDragging = draggingStampId === stamp.id;
        const stX = isCurrentDragging && dragStampPosition ? dragStampPosition.x : stamp.x;
        const stY = isCurrentDragging && dragStampPosition ? dragStampPosition.y : stamp.y;

        const isCurrentResizing = resizingStampId === stamp.id;
        const stW = isCurrentResizing && stampDimensions ? stampDimensions.w : stamp.width;
        const stH = isCurrentResizing && stampDimensions ? stampDimensions.h : stamp.height;

        return (
          <div
            key={stamp.id}
            onClick={e => {
              e.stopPropagation();
              setActiveItem(null);
              setActiveRedaction(null);
              setActiveSignature(null);
              setActiveStamp(stamp.id);
            }}
            onPointerDown={e => handleStampDragStart(stamp.id, stamp.x, stamp.y, e)}
            style={{
              position: 'absolute',
              left: stX,
              top: stY,
              width: stW,
              height: stH,
              transform: `rotate(${stamp.rotation}deg)`,
              opacity: stamp.opacity,
              border: isSelected ? '2px dashed #4ade80' : '1px solid transparent',
              borderRadius: 6,
              boxShadow: isSelected ? '0 0 12px rgba(74,222,128,0.4)' : 'none',
              zIndex: 22,
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'none',
            }}
          >
            <img
              src={stamp.dataUrl}
              alt={stamp.label || 'Stamp'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />

            {isSelected && (
              <button
                onPointerDown={e => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  deleteStamp(stamp.id);
                  setActiveStamp(null);
                }}
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  zIndex: 30,
                }}
                title="Remove stamp"
              >
                <Trash2 size={12} />
              </button>
            )}

            {isSelected && (
              <button
                onPointerDown={e => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  const ROTATION_STEPS = [-15, 0, 15, 45, 90, -90];
                  const currentIndex = ROTATION_STEPS.indexOf(stamp.rotation);
                  const nextRotation = ROTATION_STEPS[(currentIndex + 1) % ROTATION_STEPS.length] ?? 0;
                  updateStamp(stamp.id, { rotation: nextRotation });
                }}
                style={{
                  position: 'absolute',
                  top: -12,
                  left: -12,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#4d6bfa',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  zIndex: 30,
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

        return (
          <div
            key={item.id}
            className={`text-overlay-item${isActive ? ' active' : ''}`}
            style={{
              left: itemX,
              top: itemY,
              minWidth: item.width,
              width: hasChanges || isActive ? 'max-content' : item.width,
              minHeight: item.height,
              height: item.height,
              fontSize: item.fontSize + item.format.fontSizeDelta,
              lineHeight: 1,
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
            onClick={e => onItemClick(item.id, e)}
            title={hasChanges ? `Edited — click to re-edit` : 'Click to edit'}
          >
            {isActive ? (
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

                <input
                  type="text"
                  className="text-overlay-input"
                  value={currentVal}
                  autoFocus
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
                  }}
                  onChange={e => onItemTextChange(item.id, e.target.value)}
                  onBlur={() => onItemBlur(item.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      onItemBlur(item.id);
                    }
                  }}
                />
              </>
            ) : (
              <span
                style={{
                  display: 'inline-block',
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
