import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X, RotateCcw, Info,
  GripVertical, Plus, ShieldCheck, EyeOff, Eraser, MousePointer,
  Trash2, CheckCircle2, AlertTriangle, FileCheck, PenTool, Tag, RotateCw
} from 'lucide-react';
import type {
  PDFTextItem, TextFormat, PDFEditorState, RedactionBox, EditorTool,
  ExportMode, VerificationReport, PDFSignatureItem, PDFStampItem
} from '../types/pdf';
import TextFormatToolbar from './TextFormatToolbar';
import SignatureModal from './SignatureModal';
import StampModal from './StampModal';

interface PDFEditorProps {
  state: PDFEditorState;
  renderPage: (canvas: HTMLCanvasElement, page: number, scale: number) => Promise<PDFTextItem[]>;
  updateText: (id: string, text: string) => void;
  updateFormat: (id: string, partial: Partial<TextFormat>) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  deleteItem: (id: string) => void;
  addTextField: () => void;
  addRedactionBox: (box: Omit<RedactionBox, 'id' | 'pageIndex'> & { pageIndex?: number }) => void;
  updateRedactionBox: (id: string, partial: Partial<RedactionBox>) => void;
  deleteRedactionBox: (id: string) => void;
  addSignature: (sig: Omit<PDFSignatureItem, 'id' | 'pageIndex'> & { pageIndex?: number }) => void;
  updateSignature: (id: string, partial: Partial<PDFSignatureItem>) => void;
  deleteSignature: (id: string) => void;
  setActiveSignature: (id: string | null) => void;
  addStamp: (stamp: Omit<PDFStampItem, 'id' | 'pageIndex'> & { pageIndex?: number }) => void;
  updateStamp: (id: string, partial: Partial<PDFStampItem>) => void;
  deleteStamp: (id: string) => void;
  setActiveStamp: (id: string | null) => void;
  setActiveRedaction: (id: string | null) => void;
  setActiveTool: (tool: EditorTool) => void;
  setExportMode: (mode: ExportMode) => void;
  setSanitizeMetadata: (sanitize: boolean) => void;
  setVerifyOnExport: (verify: boolean) => void;
  setVerificationReport: (report: VerificationReport | null) => void;
  runStandaloneVerification: () => Promise<VerificationReport | null>;
  undo: () => void;
  redo: () => void;
  setActiveItem: (id: string | null) => void;
  setCurrentPage: (page: number) => void;
  setScale: (scale: number) => void;
  exportPDF: (mode?: ExportMode, shouldTriggerDownload?: boolean) => void;
  resetEditor: () => void;
}

const SCALE_STEP = 0.25;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

export default function PDFEditor({
  state, renderPage, updateText, updateFormat, updatePosition, deleteItem,
  addTextField, addRedactionBox, updateRedactionBox, deleteRedactionBox,
  addSignature, updateSignature, deleteSignature, setActiveSignature,
  addStamp, updateStamp, deleteStamp, setActiveStamp,
  setActiveRedaction, setActiveTool, setExportMode, setSanitizeMetadata,
  setVerifyOnExport, setVerificationReport, runStandaloneVerification,
  undo, redo, setActiveItem, setCurrentPage, setScale, exportPDF, resetEditor,
}: PDFEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showFontNote, setShowFontNote] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showStampModal, setShowStampModal] = useState(false);

  // Dragging State for Text
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  // Dragging / Resizing State for Redaction Boxes (Blackout & Whiteout)
  const [draggingRedactId, setDraggingRedactId] = useState<string | null>(null);
  const [dragRedactPosition, setDragRedactPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRedactStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const [resizingRedactId, setResizingRedactId] = useState<string | null>(null);
  const [redactDimensions, setRedactDimensions] = useState<{ w: number; h: number } | null>(null);
  const resizeRedactStartRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number } | null>(null);

  // Dragging / Resizing State for Signatures
  const [draggingSigId, setDraggingSigId] = useState<string | null>(null);
  const [dragSigPosition, setDragSigPosition] = useState<{ x: number; y: number } | null>(null);
  const dragSigStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const [resizingSigId, setResizingSigId] = useState<string | null>(null);
  const [sigDimensions, setSigDimensions] = useState<{ w: number; h: number } | null>(null);
  const resizeSigStartRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number; ratio: number } | null>(null);

  // Dragging / Resizing State for Stamps & Images
  const [draggingStampId, setDraggingStampId] = useState<string | null>(null);
  const [dragStampPosition, setDragStampPosition] = useState<{ x: number; y: number } | null>(null);
  const dragStampStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const [resizingStampId, setResizingStampId] = useState<string | null>(null);
  const [stampDimensions, setStampDimensions] = useState<{ w: number; h: number } | null>(null);
  const resizeStampStartRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number; ratio: number } | null>(null);

  // Drawing Redaction Box State
  const [isDrawingRedaction, setIsDrawingRedaction] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Render page when page/scale changes
  useEffect(() => {
    if (!canvasRef.current || state.totalPages === 0) return;
    renderPage(canvasRef.current, state.currentPage, state.scale);
    setEditValues({});
  }, [state.currentPage, state.scale, state.totalPages, renderPage]);

  // Initialize edit values when textItems arrive
  useEffect(() => {
    const vals: Record<string, string> = {};
    state.textItems.forEach(item => { vals[item.id] = item.editedText; });
    setEditValues(vals);
  }, [state.textItems]);

  // Keyboard Shortcuts for Undo/Redo/Delete/Backspace/Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditingInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.classList.contains('text-overlay-input')
      );

      if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey) {
          if (e.key === 'z' || e.key === 'Z') {
            e.preventDefault();
            redo();
          }
        } else {
          if (e.key === 'z' || e.key === 'Z') {
            if (!isEditingInput) {
              e.preventDefault();
              undo();
            }
          } else if (e.key === 'y' || e.key === 'Y') {
            if (!isEditingInput) {
              e.preventDefault();
              redo();
            }
          }
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isEditingInput) {
          if (state.activeRedactionId) {
            e.preventDefault();
            deleteRedactionBox(state.activeRedactionId);
            setActiveRedaction(null);
          } else if (state.activeSignatureId) {
            e.preventDefault();
            deleteSignature(state.activeSignatureId);
            setActiveSignature(null);
          } else if (state.activeStampId) {
            e.preventDefault();
            deleteStamp(state.activeStampId);
            setActiveStamp(null);
          }
        }
      } else if (e.key === 'Escape') {
        setActiveItem(null);
        setActiveRedaction(null);
        setActiveSignature(null);
        setActiveStamp(null);
        setActiveTool('select');
        setIsDrawingRedaction(false);
        setDrawStart(null);
        setCurrentRect(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, state.activeRedactionId, state.activeSignatureId, state.activeStampId, deleteRedactionBox, deleteSignature, deleteStamp, setActiveItem, setActiveRedaction, setActiveSignature, setActiveStamp, setActiveTool]);

  // Handle Drag Move Action for text items
  const handleDragMouseDown = useCallback((id: string, itemX: number, itemY: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(id);
    setDragPosition({ x: itemX, y: itemY });
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: itemX,
      startY: itemY,
    };
  }, []);

  // Handle Drag Move Action for Redaction Boxes (Blackout & Whiteout)
  const handleRedactionDragStart = useCallback((id: string, boxX: number, boxY: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveRedaction(id);
    setActiveItem(null);
    setActiveSignature(null);
    setActiveStamp(null);
    setDraggingRedactId(id);
    setDragRedactPosition({ x: boxX, y: boxY });
    dragRedactStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: boxX,
      startY: boxY,
    };
  }, [setActiveItem, setActiveRedaction, setActiveSignature, setActiveStamp]);

  // Handle Resize Action for Redaction Boxes (Blackout & Whiteout)
  const handleRedactionResizeStart = useCallback((id: string, w: number, h: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveRedaction(id);
    setResizingRedactId(id);
    setRedactDimensions({ w, h });
    resizeRedactStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: w,
      startH: h,
    };
  }, [setActiveRedaction]);

  // Handle Drag Move Action for signature stamps
  const handleSignatureDragStart = useCallback((id: string, sigX: number, sigY: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSignature(id);
    setActiveItem(null);
    setActiveRedaction(null);
    setActiveStamp(null);
    setDraggingSigId(id);
    setDragSigPosition({ x: sigX, y: sigY });
    dragSigStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: sigX,
      startY: sigY,
    };
  }, [setActiveItem, setActiveRedaction, setActiveSignature, setActiveStamp]);

  // Handle Resize Action for signature stamps
  const handleSignatureResizeStart = useCallback((id: string, w: number, h: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSignature(id);
    setResizingSigId(id);
    setSigDimensions({ w, h });
    resizeSigStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: w,
      startH: h,
      ratio: w / h,
    };
  }, [setActiveSignature]);

  // Handle Drag Move Action for Stamps & Images
  const handleStampDragStart = useCallback((id: string, stampX: number, stampY: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveStamp(id);
    setActiveItem(null);
    setActiveRedaction(null);
    setActiveSignature(null);
    setDraggingStampId(id);
    setDragStampPosition({ x: stampX, y: stampY });
    dragStampStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: stampX,
      startY: stampY,
    };
  }, [setActiveItem, setActiveRedaction, setActiveSignature, setActiveStamp]);

  // Handle Resize Action for Stamps & Images
  const handleStampResizeStart = useCallback((id: string, w: number, h: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveStamp(id);
    setResizingStampId(id);
    setStampDimensions({ w, h });
    resizeStampStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: w,
      startH: h,
      ratio: w / h,
    };
  }, [setActiveStamp]);

  // Global Mouse listeners for dragging & resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      const canvasWidth = canvas ? canvas.width : 2000;
      const canvasHeight = canvas ? canvas.height : 2000;

      // 1. Text item dragging
      if (draggingId && dragStartRef.current) {
        const start = dragStartRef.current;
        const deltaX = e.clientX - start.mouseX;
        const deltaY = e.clientY - start.mouseY;
        const item = state.textItems.find(i => i.id === draggingId);
        if (item) {
          const newX = Math.max(0, Math.min(canvasWidth - item.width, start.startX + deltaX));
          const newY = Math.max(0, Math.min(canvasHeight - item.height, start.startY + deltaY));
          setDragPosition({ x: newX, y: newY });
        }
      }

      // 2. Redaction box dragging
      if (draggingRedactId && dragRedactStartRef.current) {
        const start = dragRedactStartRef.current;
        const deltaX = e.clientX - start.mouseX;
        const deltaY = e.clientY - start.mouseY;
        const currentRedacts = state.redactions[state.currentPage] || [];
        const box = currentRedacts.find(b => b.id === draggingRedactId);
        if (box) {
          const newX = Math.max(0, Math.min(canvasWidth - box.width, start.startX + deltaX));
          const newY = Math.max(0, Math.min(canvasHeight - box.height, start.startY + deltaY));
          setDragRedactPosition({ x: newX, y: newY });
        }
      }

      // 3. Redaction box resizing
      if (resizingRedactId && resizeRedactStartRef.current) {
        const start = resizeRedactStartRef.current;
        const deltaX = e.clientX - start.mouseX;
        const deltaY = e.clientY - start.mouseY;
        const newW = Math.max(10, Math.min(canvasWidth, start.startW + deltaX));
        const newH = Math.max(8, Math.min(canvasHeight, start.startH + deltaY));
        setRedactDimensions({ w: newW, h: newH });
      }

      // 4. Signature dragging
      if (draggingSigId && dragSigStartRef.current) {
        const start = dragSigStartRef.current;
        const deltaX = e.clientX - start.mouseX;
        const deltaY = e.clientY - start.mouseY;
        const currentSigs = state.signatures[state.currentPage] || [];
        const sig = currentSigs.find(s => s.id === draggingSigId);
        if (sig) {
          const newX = Math.max(0, Math.min(canvasWidth - sig.width, start.startX + deltaX));
          const newY = Math.max(0, Math.min(canvasHeight - sig.height, start.startY + deltaY));
          setDragSigPosition({ x: newX, y: newY });
        }
      }

      // 5. Signature resizing
      if (resizingSigId && resizeSigStartRef.current) {
        const start = resizeSigStartRef.current;
        const deltaX = e.clientX - start.mouseX;
        const newW = Math.max(40, Math.min(600, start.startW + deltaX));
        const newH = Math.max(20, newW / start.ratio);
        setSigDimensions({ w: newW, h: newH });
      }

      // 6. Stamp dragging
      if (draggingStampId && dragStampStartRef.current) {
        const start = dragStampStartRef.current;
        const deltaX = e.clientX - start.mouseX;
        const deltaY = e.clientY - start.mouseY;
        const currentStamps = state.stamps[state.currentPage] || [];
        const st = currentStamps.find(s => s.id === draggingStampId);
        if (st) {
          const newX = Math.max(0, Math.min(canvasWidth - st.width, start.startX + deltaX));
          const newY = Math.max(0, Math.min(canvasHeight - st.height, start.startY + deltaY));
          setDragStampPosition({ x: newX, y: newY });
        }
      }

      // 7. Stamp resizing
      if (resizingStampId && resizeStampStartRef.current) {
        const start = resizeStampStartRef.current;
        const deltaX = e.clientX - start.mouseX;
        const newW = Math.max(30, Math.min(600, start.startW + deltaX));
        const newH = Math.max(20, newW / start.ratio);
        setStampDimensions({ w: newW, h: newH });
      }
    };

    const handleMouseUp = () => {
      // 1. Text item drop
      if (draggingId && dragStartRef.current && dragPosition) {
        const start = dragStartRef.current;
        const hasMoved = Math.abs(dragPosition.x - start.startX) > 0.5 || Math.abs(dragPosition.y - start.startY) > 0.5;
        if (hasMoved) {
          updatePosition(draggingId, dragPosition.x, dragPosition.y);
        }
        setDraggingId(null);
        setDragPosition(null);
        dragStartRef.current = null;
      }

      // 2. Redaction box drop
      if (draggingRedactId && dragRedactStartRef.current && dragRedactPosition) {
        const start = dragRedactStartRef.current;
        const hasMoved = Math.abs(dragRedactPosition.x - start.startX) > 0.5 || Math.abs(dragRedactPosition.y - start.startY) > 0.5;
        if (hasMoved) {
          updateRedactionBox(draggingRedactId, { x: dragRedactPosition.x, y: dragRedactPosition.y });
        }
        setDraggingRedactId(null);
        setDragRedactPosition(null);
        dragRedactStartRef.current = null;
      }

      // 3. Redaction box resize end
      if (resizingRedactId && resizeRedactStartRef.current && redactDimensions) {
        updateRedactionBox(resizingRedactId, { width: redactDimensions.w, height: redactDimensions.h });
        setResizingRedactId(null);
        setRedactDimensions(null);
        resizeRedactStartRef.current = null;
      }

      // 4. Signature drop
      if (draggingSigId && dragSigStartRef.current && dragSigPosition) {
        const start = dragSigStartRef.current;
        const hasMoved = Math.abs(dragSigPosition.x - start.startX) > 0.5 || Math.abs(dragSigPosition.y - start.startY) > 0.5;
        if (hasMoved) {
          updateSignature(draggingSigId, { x: dragSigPosition.x, y: dragSigPosition.y });
        }
        setDraggingSigId(null);
        setDragSigPosition(null);
        dragSigStartRef.current = null;
      }

      // 5. Signature resize end
      if (resizingSigId && resizeSigStartRef.current && sigDimensions) {
        updateSignature(resizingSigId, { width: sigDimensions.w, height: sigDimensions.h });
        setResizingSigId(null);
        setSigDimensions(null);
        resizeSigStartRef.current = null;
      }

      // 6. Stamp drop
      if (draggingStampId && dragStampStartRef.current && dragStampPosition) {
        const start = dragStampStartRef.current;
        const hasMoved = Math.abs(dragStampPosition.x - start.startX) > 0.5 || Math.abs(dragStampPosition.y - start.startY) > 0.5;
        if (hasMoved) {
          updateStamp(draggingStampId, { x: dragStampPosition.x, y: dragStampPosition.y });
        }
        setDraggingStampId(null);
        setDragStampPosition(null);
        dragStampStartRef.current = null;
      }

      // 7. Stamp resize end
      if (resizingStampId && resizeStampStartRef.current && stampDimensions) {
        updateStamp(resizingStampId, { width: stampDimensions.w, height: stampDimensions.h });
        setResizingStampId(null);
        setStampDimensions(null);
        resizeStampStartRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragPosition, draggingRedactId, dragRedactPosition, resizingRedactId, redactDimensions, draggingSigId, dragSigPosition, resizingSigId, sigDimensions, draggingStampId, dragStampPosition, resizingStampId, stampDimensions, state.signatures, state.stamps, state.redactions, state.currentPage, state.textItems, updatePosition, updateRedactionBox, updateSignature, updateStamp]);

  // Handle Redaction Box Interactive Drawing on Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (state.activeTool !== 'blackout' && state.activeTool !== 'whiteout') {
      setActiveItem(null);
      setActiveRedaction(null);
      setActiveSignature(null);
      setActiveStamp(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setIsDrawingRedaction(true);
    setDrawStart({ x: startX, y: startY });
    setCurrentRect({ x: startX, y: startY, w: 0, h: 0 });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRedaction || !drawStart) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const w = Math.abs(currentX - drawStart.x);
    const h = Math.abs(currentY - drawStart.y);

    setCurrentRect({ x, y, w, h });
  };

  const handleCanvasMouseUp = () => {
    if (isDrawingRedaction && currentRect && drawStart) {
      const boxType = state.activeTool === 'blackout' ? 'blackout' : 'whiteout';
      if (currentRect.w > 8 && currentRect.h > 8) {
        addRedactionBox({
          x: currentRect.x,
          y: currentRect.y,
          width: currentRect.w,
          height: currentRect.h,
          type: boxType,
        });
      } else {
        addRedactionBox({
          x: drawStart.x - 40,
          y: drawStart.y - 12,
          width: 80,
          height: 24,
          type: boxType,
        });
      }
      setIsDrawingRedaction(false);
      setDrawStart(null);
      setCurrentRect(null);
      setActiveTool('select');
    }
  };

  const handleItemClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveRedaction(null);
    setActiveSignature(null);
    setActiveStamp(null);
    setActiveItem(id);
  }, [setActiveItem, setActiveRedaction, setActiveSignature, setActiveStamp]);

  const handleInputChange = useCallback((id: string, val: string) => {
    setEditValues(prev => ({ ...prev, [id]: val }));
    updateText(id, val);
  }, [updateText]);

  const handleBlur = useCallback(() => {
    setActiveItem(null);
  }, [setActiveItem]);

  const zoom = (dir: 1 | -1) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale + dir * SCALE_STEP));
    setScale(next);
  };

  // Handle signature inserted from modal
  const handleSignatureInserted = (dataUrl: string, width: number, height: number) => {
    const canvas = canvasRef.current;
    const defaultX = canvas ? Math.max(50, canvas.width / 2 - width / 2) : 100;
    const defaultY = canvas ? Math.max(50, canvas.height / 2 - height / 2) : 200;

    addSignature({
      dataUrl,
      x: defaultX,
      y: defaultY,
      width,
      height,
    });
  };

  // Handle stamp inserted from modal
  const handleStampInserted = (
    dataUrl: string,
    width: number,
    height: number,
    rotation: number,
    opacity: number,
    label?: string
  ) => {
    const canvas = canvasRef.current;
    const defaultX = canvas ? Math.max(50, canvas.width / 2 - width / 2) : 100;
    const defaultY = canvas ? Math.max(50, canvas.height / 2 - height / 2) : 180;

    addStamp({
      type: label ? 'preset-stamp' : 'custom-image',
      dataUrl,
      label,
      x: defaultX,
      y: defaultY,
      width,
      height,
      rotation,
      opacity,
    });
  };

  // Quick cycle stamp rotation (-15° -> 0° -> 15° -> 45° -> -30°)
  const cycleStampRotation = (id: string, currentRotation: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const ROTATION_STEPS = [-15, 0, 15, 45, -30];
    const currentIndex = ROTATION_STEPS.indexOf(currentRotation);
    const nextRotation = ROTATION_STEPS[(currentIndex + 1) % ROTATION_STEPS.length] ?? 0;
    updateStamp(id, { rotation: nextRotation });
  };

  const {
    totalPages, currentPage, scale, textItems, activeItemId, activeRedactionId, activeSignatureId, activeStampId,
    activeTool, exportMode, sanitizeMetadata, verifyOnExport, verificationReport,
    isVerifying, isDirty, isLoading, isExporting, error
  } = state;

  const currentRedactions = state.redactions[currentPage] || [];
  const currentSignatures = state.signatures[currentPage] || [];
  const currentStamps = state.stamps[currentPage] || [];
  const allRedactionCount = Object.values(state.redactions).reduce((acc, list) => acc + list.length, 0);
  const allSignatureCount = Object.values(state.signatures).reduce((acc, list) => acc + list.length, 0);
  const allStampCount = Object.values(state.stamps).reduce((acc, list) => acc + list.length, 0);

  return (
    <section id="editor" style={{ padding: '0 0 4rem' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Top Control Bar */}
        <div className="card-glass" style={{
          borderRadius: '1rem 1rem 0 0',
          padding: '0.75rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
          borderBottom: 'none',
        }}>
          {/* File name */}
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f0f0', flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {state.fileName}
          </span>

          {/* Primary Editor Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.04)', padding: '0.25rem', borderRadius: '0.65rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              className={`btn-icon ${activeTool === 'select' ? 'btn-active' : ''}`}
              style={{
                width: 32, height: 32,
                background: activeTool === 'select' ? 'rgba(77,107,250,0.25)' : 'transparent',
                color: activeTool === 'select' ? '#7c9aff' : 'rgba(240,240,240,0.7)',
                borderColor: activeTool === 'select' ? '#4d6bfa' : 'transparent',
              }}
              onClick={() => setActiveTool('select')}
              title="Select & Edit Existing Text"
            >
              <MousePointer size={14} />
            </button>

            <button
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#f0f0f0',
              }}
              onClick={addTextField}
              title="Add New Text Field"
            >
              <Plus size={13} color="#4d6bfa" /> Add Text
            </button>

            <button
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(77,107,250,0.12)',
                borderColor: 'rgba(77,107,250,0.3)',
                color: '#7c9aff',
                fontWeight: 600,
              }}
              onClick={() => setShowSignatureModal(true)}
              title="Sign PDF: Draw, Type, or Upload Signature Stamp"
            >
              <PenTool size={13} color="#7c9aff" /> Sign PDF
            </button>

            <button
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(34,197,94,0.12)',
                borderColor: 'rgba(34,197,94,0.3)',
                color: '#4ade80',
                fontWeight: 600,
              }}
              onClick={() => setShowStampModal(true)}
              title="Stamp Documents Online Free: Insert APPROVED, PAID, Checkmarks, or Logos"
            >
              <Tag size={13} color="#4ade80" /> Stamp / Image
            </button>

            <button
              className={`btn-secondary ${activeTool === 'blackout' ? 'btn-active' : ''}`}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: activeTool === 'blackout' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: activeTool === 'blackout' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                color: activeTool === 'blackout' ? '#fca5a5' : '#f0f0f0',
                fontWeight: activeTool === 'blackout' ? 700 : 500,
              }}
              onClick={() => setActiveTool(activeTool === 'blackout' ? 'select' : 'blackout')}
              title="Draw Permanent Blackout Redaction Box"
            >
              <EyeOff size={13} color="#ef4444" /> Blackout Redact
            </button>

            <button
              className={`btn-secondary ${activeTool === 'whiteout' ? 'btn-active' : ''}`}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: activeTool === 'whiteout' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: activeTool === 'whiteout' ? '#ffffff' : 'rgba(255,255,255,0.1)',
                color: activeTool === 'whiteout' ? '#ffffff' : '#f0f0f0',
                fontWeight: activeTool === 'whiteout' ? 700 : 500,
              }}
              onClick={() => setActiveTool(activeTool === 'whiteout' ? 'select' : 'whiteout')}
              title="Draw Whiteout Area Eraser"
            >
              <Eraser size={13} color="#ffffff" /> Whiteout
            </button>
          </div>

          {/* Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => zoom(-1)} disabled={scale <= MIN_SCALE} aria-label="Zoom out">
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.6)', minWidth: 44, textAlign: 'center', fontWeight: 600 }}>
              {Math.round(scale * 100)}%
            </span>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => zoom(1)} disabled={scale >= MAX_SCALE} aria-label="Zoom in">
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Page nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} aria-label="Previous page">
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.6)', minWidth: 56, textAlign: 'center', fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </span>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} aria-label="Next page">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Font note */}
          <button
            className="btn-icon"
            style={{ width: 32, height: 32, position: 'relative' }}
            onClick={() => setShowFontNote(p => !p)}
            title="Font notice"
          >
            <Info size={14} />
            {showFontNote && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
                background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem', padding: '0.75rem 1rem', width: 260,
                fontSize: '0.75rem', color: 'rgba(240,240,240,0.7)',
                textAlign: 'left', lineHeight: 1.6, zIndex: 100,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                <strong style={{ color: '#f0f0f0' }}>Font Notice:</strong> Edited text uses standard fonts
                (Helvetica, Times-Roman, Courier). The font may differ slightly from the original PDF's embedded font.
              </div>
            )}
          </button>

          {/* Redaction Verification Quick Action Button */}
          {isDirty && (
            <button
              className="btn-secondary"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(34,197,94,0.12)',
                borderColor: 'rgba(34,197,94,0.3)',
                color: '#4ade80',
              }}
              onClick={runStandaloneVerification}
              disabled={isVerifying}
              title="Audit and verify that redacted text cannot be extracted"
            >
              {isVerifying ? (
                <span style={{ width: 12, height: 12, border: '2px solid rgba(74,222,128,0.3)', borderTopColor: '#4ade80', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
              ) : (
                <FileCheck size={13} />
              )}
              {isVerifying ? 'Auditing…' : 'Verify Redactions'}
            </button>
          )}

          {/* Reset */}
          <button className="btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }} onClick={resetEditor}>
            <RotateCcw size={13} /> New PDF
          </button>

          {/* Export / Download Button */}
          <button
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setShowExportModal(true)}
            disabled={!isDirty || isExporting}
            title={!isDirty ? 'Make some edits first' : 'Download edited PDF'}
          >
            {isExporting ? (
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
            ) : <Download size={14} />}
            {isExporting ? 'Processing…' : 'Download PDF'}
          </button>

          {/* Close */}
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={resetEditor} aria-label="Close editor">
            <X size={14} />
          </button>
        </div>

        {/* Redaction Tool Active Indicator Bar */}
        {(activeTool === 'blackout' || activeTool === 'whiteout') && (
          <div style={{
            background: activeTool === 'blackout' ? 'rgba(239,68,68,0.15)' : 'rgba(77,107,250,0.15)',
            borderLeft: `3px solid ${activeTool === 'blackout' ? '#ef4444' : '#4d6bfa'}`,
            padding: '0.5rem 1.25rem',
            fontSize: '0.82rem',
            color: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>
              <strong>{activeTool === 'blackout' ? '⬛ Blackout Redaction Mode:' : '⬜ Whiteout Mode:'}</strong> Click and drag on the PDF page to create a redaction zone.
            </span>
            <button
              onClick={() => setActiveTool('select')}
              style={{ background: 'transparent', border: 'none', color: 'rgba(240,240,240,0.6)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Cancel (Esc)
            </button>
          </div>
        )}

        {/* Canvas + text overlay area */}
        <div
          ref={containerRef}
          className="card-glass"
          style={{
            borderRadius: '0 0 1rem 1rem',
            padding: '1.5rem',
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: '75vh',
            cursor: activeTool === 'blackout' || activeTool === 'whiteout' ? 'crosshair' : 'default',
          }}
          onClick={() => {
            if (activeTool === 'select') {
              setActiveItem(null);
              setActiveRedaction(null);
              setActiveSignature(null);
              setActiveStamp(null);
            }
          }}
        >
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', color: 'rgba(240,240,240,0.5)' }}>
              <span style={{ width: 28, height: 28, border: '3px solid rgba(77,107,250,0.3)', borderTopColor: '#4d6bfa', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
              <span>Rendering page…</span>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '1rem 1.25rem', color: '#fca5a5', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                className="pdf-canvas-wrapper"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                style={{
                  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                  position: 'relative',
                  userSelect: 'none',
                }}
              >
                <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 4 }} />

                {/* White cover-up boxes for deleted or moved text items */}
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

                {/* Redaction Boxes for Current Page (Blackout & Whiteout) */}
                {currentRedactions.map(box => {
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
                      onMouseDown={e => {
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
                      {/* Delete Redaction Button (Works for both Blackout and Whiteout) */}
                      {isSelected && (
                        <button
                          onMouseDown={e => {
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
                          title={`Delete ${box.type === 'blackout' ? 'Blackout' : 'Whiteout'} Redaction (or press Delete)`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      {/* Resize Corner Handle for Redaction Box */}
                      {isSelected && (
                        <div
                          onMouseDown={e => {
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
                          }}
                          title="Drag to resize redaction area"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Digital Signature Stamps for Current Page */}
                {currentSignatures.map(sig => {
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
                      onMouseDown={e => handleSignatureDragStart(sig.id, sig.x, sig.y, e)}
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

                      {/* Delete Signature Button */}
                      {isSelected && (
                        <button
                          onMouseDown={e => {
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

                      {/* Resize Corner Handle */}
                      {isSelected && (
                        <div
                          onMouseDown={e => handleSignatureResizeStart(sig.id, sig.width, sig.height, e)}
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
                          }}
                          title="Drag to resize signature"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Official Stamps & Custom Images for Current Page */}
                {currentStamps.map(stamp => {
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
                      onMouseDown={e => handleStampDragStart(stamp.id, stamp.x, stamp.y, e)}
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

                      {/* Delete Stamp Button */}
                      {isSelected && (
                        <button
                          onMouseDown={e => {
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

                      {/* Quick Rotate Button */}
                      {isSelected && (
                        <button
                          onClick={e => cycleStampRotation(stamp.id, stamp.rotation, e)}
                          style={{
                            position: 'absolute',
                            top: -12,
                            left: -12,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: '#4ade80',
                            color: '#000',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                            zIndex: 30,
                          }}
                          title={`Rotate (Current: ${stamp.rotation}°)`}
                        >
                          <RotateCw size={12} />
                        </button>
                      )}

                      {/* Resize Corner Handle */}
                      {isSelected && (
                        <div
                          onMouseDown={e => handleStampResizeStart(stamp.id, stamp.width, stamp.height, e)}
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
                          }}
                          title="Drag to resize stamp"
                        />
                      )}
                    </div>
                  );
                })}

                {/* In-progress Dragging Redaction Box Preview */}
                {isDrawingRedaction && currentRect && (
                  <div
                    style={{
                      position: 'absolute',
                      left: currentRect.x,
                      top: currentRect.y,
                      width: currentRect.w,
                      height: currentRect.h,
                      background: state.activeTool === 'blackout' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                      border: `2px dashed ${state.activeTool === 'blackout' ? '#ef4444' : '#4d6bfa'}`,
                      zIndex: 25,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Text overlays */}
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
                        background: isActive ? '#ffffff' : (hasChanges && !item.isAdded ? '#ffffff' : undefined),
                        borderColor: !isActive && hasChanges ? 'rgba(77, 107, 250, 0.5)' : undefined,
                        overflow: 'visible',
                        zIndex: hasChanges || isActive ? 10 : 1,
                      }}
                      onClick={e => handleItemClick(item.id, e)}
                      title={hasChanges ? `Edited — click to re-edit` : 'Click to edit'}
                    >
                      {isActive ? (
                        <>
                          <div
                            className="drag-handle"
                            onMouseDown={e => handleDragMouseDown(item.id, item.x, item.y, e)}
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
                            }}
                            title="Drag to reposition text"
                          >
                            <GripVertical size={14} />
                          </div>

                          {(() => {
                            const canvas = canvasRef.current;
                            const canvasWidth = canvas ? canvas.width : 2000;
                            const toolbarWidth = 380;
                            const preferredLeftAbs = itemX + item.width / 2 - toolbarWidth / 2;
                            const clampedLeftAbs = Math.max(10, Math.min(canvasWidth - toolbarWidth - 10, preferredLeftAbs));
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
                            className="text-overlay-input"
                            autoFocus
                            value={currentVal}
                            size={Math.max(currentVal.length + 2, 8)}
                            onChange={e => handleInputChange(item.id, e.target.value)}
                            onBlur={handleBlur}
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => {
                              if (e.key === 'Escape' || e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            style={{
                              fontSize: item.fontSize + item.format.fontSizeDelta,
                              lineHeight: 1,
                              minWidth: Math.max(item.width, 80),
                              fontWeight: item.format.bold ? 'bold' : 'normal',
                              fontStyle: item.format.italic ? 'italic' : 'normal',
                              textDecoration: item.format.underline ? 'underline' : 'none',
                              fontFamily: item.format.fontFamily === 'times' ? 'Georgia, "Times New Roman", Times, serif' : item.format.fontFamily === 'courier' ? '"Courier New", Courier, monospace' : 'Helvetica, Arial, sans-serif',
                              color: item.format.color,
                            }}
                          />
                        </>
                      ) : hasChanges ? (
                        <span style={{
                          display: 'block',
                          width: 'max-content',
                          fontSize: item.fontSize + item.format.fontSizeDelta,
                          lineHeight: 1,
                          color: item.format.color,
                          fontWeight: item.format.bold ? 'bold' : 'normal',
                          fontStyle: item.format.italic ? 'italic' : 'normal',
                          textDecoration: item.format.underline ? 'underline' : 'none',
                          fontFamily: item.format.fontFamily === 'times' ? 'Georgia, "Times New Roman", Times, serif' : item.format.fontFamily === 'courier' ? '"Courier New", Courier, monospace' : 'Helvetica, Arial, sans-serif',
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                          padding: '0 2px',
                        }}>
                          {currentVal}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: item.fontSize,
                          lineHeight: 1,
                          opacity: 0,
                          userSelect: 'none',
                          display: 'block',
                          width: '100%',
                          height: '100%',
                        }}>
                          {item.originalText}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Status / Summary Badge */}
        {isDirty && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(240,240,240,0.55)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
              <span>Document modified across {Object.keys(state.pageItems).length || 1} page(s)</span>
              {allRedactionCount > 0 && (
                <span style={{ color: '#fca5a5', fontWeight: 600 }}>· {allRedactionCount} Redaction(s)</span>
              )}
              {allSignatureCount > 0 && (
                <span style={{ color: '#7c9aff', fontWeight: 600 }}>· {allSignatureCount} Signature(s)</span>
              )}
              {allStampCount > 0 && (
                <span style={{ color: '#4ade80', fontWeight: 600 }}>· {allStampCount} Stamp(s)</span>
              )}
            </div>
            <div>
              Ready to export · 100% In-Browser Sanitization, Signing & Stamping
            </div>
          </div>
        )}

      </div>

      {/* Signature Creator Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onInsert={handleSignatureInserted}
      />

      {/* Stamp & Image Creator Modal */}
      <StampModal
        isOpen={showStampModal}
        onClose={() => setShowStampModal(false)}
        onInsert={handleStampInserted}
      />

      {/* Export & Sanitization Settings Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1.5rem',
        }}>
          <div className="card-glass" style={{
            maxWidth: 560,
            width: '100%',
            borderRadius: '1.25rem',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(77,107,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} color="#4d6bfa" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>Export Sanitized PDF</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>Select forensic export mode for your document</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowExportModal(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Mode selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <label
                onClick={() => setExportMode('sanitized')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '0.85rem',
                  background: exportMode === 'sanitized' ? 'rgba(77,107,250,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${exportMode === 'sanitized' ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="exportMode"
                  checked={exportMode === 'sanitized'}
                  onChange={() => setExportMode('sanitized')}
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#f0f0f0', fontSize: '0.92rem' }}>Permanent Stream Sanitization (Flattened)</strong>
                    <span style={{ fontSize: '0.65rem', background: '#22c55e', color: '#000', padding: '0.15rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>RECOMMENDED</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.5 }}>
                    Renders pages at crisp 300 DPI high resolution and <strong>permanently destroys underlying text streams, OCR layers, and hidden vector objects</strong>. Guaranteed 100% unrecoverable by any PDF inspector or text extraction tool.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setExportMode('vector')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '0.85rem',
                  background: exportMode === 'vector' ? 'rgba(77,107,250,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${exportMode === 'vector' ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="exportMode"
                  checked={exportMode === 'vector'}
                  onChange={() => setExportMode('vector')}
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#f0f0f0', fontSize: '0.92rem' }}>Standard Vector Overlay</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.5 }}>
                    Adds text, stamp & shape overlays on top of the original vector streams. Keeps text selectable in external viewers. <em>(Not recommended for confidential PII redactions)</em>.
                  </p>
                </div>
              </label>
            </div>

            {/* Optional Verification & Metadata Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem', color: '#f0f0f0' }}>
                <input
                  type="checkbox"
                  checked={verifyOnExport}
                  onChange={e => setVerifyOnExport(e.target.checked)}
                />
                <span><strong>Redaction Verification Scan:</strong> Audit exported binary to verify redacted text is 100% unextractable.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem', color: '#f0f0f0' }}>
                <input
                  type="checkbox"
                  checked={sanitizeMetadata}
                  onChange={e => setSanitizeMetadata(e.target.checked)}
                />
                <span><strong>Strip Document Metadata:</strong> Purges author, creation dates, and editing software fingerprints.</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => {
                  setShowExportModal(false);
                  exportPDF(exportMode, true);
                }}
              >
                <Download size={15} />
                {exportMode === 'sanitized' ? 'Download Sanitized PDF' : 'Download Vector PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redaction Verification Audit Report Modal */}
      {verificationReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 11000,
          padding: '1.5rem',
        }}>
          <div className="card-glass" style={{
            maxWidth: 620,
            width: '100%',
            borderRadius: '1.25rem',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
            border: `1.5px solid ${verificationReport.passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: verificationReport.passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {verificationReport.passed ? (
                    <CheckCircle2 size={24} color="#22c55e" />
                  ) : (
                    <AlertTriangle size={24} color="#ef4444" />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f0f0f0' }}>
                    {verificationReport.passed ? 'Redaction Verification Passed' : 'Redaction Warning'}
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: verificationReport.passed ? '#86efac' : '#fca5a5' }}>
                    {verificationReport.passed
                      ? '“We scanned the exported PDF and could not find the redacted text.”'
                      : 'Sensitive text was detected in the underlying vector streams.'}
                  </p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setVerificationReport(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Audit Summary Box */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '0.85rem',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.84rem',
              color: 'rgba(240,240,240,0.7)',
              lineHeight: 1.6,
            }}>
              {verificationReport.passed ? (
                <div>
                  A complete forensic in-browser scan of the exported PDF binary verified that <strong>{verificationReport.checks.length} redacted phrases</strong> have been completely purged from all text streams, OCR layers, and hidden vector paths.
                  {verificationReport.metadataStripped && (
                    <span style={{ display: 'block', marginTop: '0.35rem', color: '#86efac' }}>
                      ✓ All document author metadata & editing software fingerprints stripped.
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  The document was exported in <strong>Standard Vector Overlay</strong> mode. The visual box was drawn over the text, but the original text bytes remain extractable in the underlying PDF stream.
                  <div style={{ marginTop: '0.5rem', color: '#fca5a5', fontWeight: 600 }}>
                    Recommended: Switch to Permanent Stream Sanitization (Flattened) to permanently purge these text bytes.
                  </div>
                </div>
              )}
            </div>

            {/* Itemized Audit Checklist */}
            {verificationReport.checks.length > 0 && (
              <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: '1.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.25)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(240,240,240,0.4)', padding: '0.25rem 0.5rem 0.5rem', fontWeight: 700 }}>
                  Itemized Forensic Check Results ({verificationReport.checks.length} items)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {verificationReport.checks.map((check, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(255,255,255,0.02)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
                        <span style={{ color: check.status === 'purged' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                          {check.status === 'purged' ? '✓' : '✗'}
                        </span>
                        <span style={{ color: '#f0f0f0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          &ldquo;{check.term.length > 35 ? check.term.substring(0, 35) + '…' : check.term}&rdquo;
                        </span>
                        <span style={{ color: 'rgba(240,240,240,0.4)', fontSize: '0.72rem' }}>
                          (Pg {check.pageIndex})
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 4,
                        background: check.status === 'purged' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.2)',
                        color: check.status === 'purged' ? '#4ade80' : '#fca5a5',
                      }}>
                        {check.status === 'purged' ? '0 FOUND (PURGED)' : `${check.foundCount} OCCURRENCE(S)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {!verificationReport.passed ? (
                <button
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.5rem', background: '#22c55e', borderColor: '#22c55e', color: '#000', fontWeight: 700 }}
                  onClick={() => {
                    setExportMode('sanitized');
                    setVerificationReport(null);
                    exportPDF('sanitized', true);
                  }}
                >
                  Switch to Sanitized Mode & Download
                </button>
              ) : (
                <button
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => {
                    setVerificationReport(null);
                    exportPDF(verificationReport.mode, true);
                  }}
                >
                  <Download size={15} />
                  Download Verified PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
