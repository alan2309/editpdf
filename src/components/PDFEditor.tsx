import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X, RotateCcw, Info,
  Plus, EyeOff, Eraser, MousePointer, Layers,
  CheckCircle2, AlertTriangle, FileCheck, PenTool, Tag, Search, ArrowRight
} from 'lucide-react';
import type {
  PDFTextItem, TextFormat, PDFEditorState, RedactionBox, EditorTool,
  ExportMode, VerificationReport, PDFSignatureItem, PDFStampItem, SearchMatch
} from '../types/pdf';
import PDFPage from './PDFPage';
import SignatureModal from './SignatureModal';
import StampModal from './StampModal';
import FindReplaceBar from './FindReplaceBar';
import PageThumbnailsSidebar from './PageThumbnailsSidebar';
import SecurityStatusBadge from './SecurityStatusBadge';

interface PDFEditorProps {
  state: PDFEditorState;
  renderPage: (canvas: HTMLCanvasElement, page: number, scale: number) => Promise<PDFTextItem[]>;
  cancelPageRender?: (pageNum: number) => void;
  beginTextEdit?: (id: string) => void;
  updateTextWithoutHistory?: (id: string, text: string) => void;
  commitTextEdit?: (id: string) => void;
  cancelTextEdit?: (id: string) => void;
  updateText: (id: string, text: string) => void;
  updateFormat: (id: string, partial: Partial<TextFormat>) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  deleteItem: (id: string) => void;
  addTextField: (targetPage?: number) => void;
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
  searchDocumentMatches: (query: string, matchCase: boolean, wholeWord: boolean) => Promise<SearchMatch[]>;
  replaceSingleMatch: (match: SearchMatch | string, pageNumberOrRep: number | string, replaceWith?: string, query?: string, matchCase?: boolean, wholeWord?: boolean, matchStart?: number, matchEnd?: number) => void;
  replaceAllMatches: (query: string, replaceWith: string, matchCase: boolean, wholeWord: boolean) => Promise<number>;
  redactAllMatches: (query: string, matchCase: boolean, wholeWord: boolean) => Promise<number>;
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
  state, renderPage, cancelPageRender = () => {},
  beginTextEdit, updateTextWithoutHistory, commitTextEdit, cancelTextEdit: _cancelTextEdit,
  updateText: _updateText, updateFormat, updatePosition, deleteItem,
  addTextField, addRedactionBox, updateRedactionBox, deleteRedactionBox,
  addSignature, updateSignature, deleteSignature, setActiveSignature,
  addStamp, updateStamp, deleteStamp, setActiveStamp,
  searchDocumentMatches, replaceSingleMatch, replaceAllMatches, redactAllMatches,
  setActiveRedaction, setActiveTool, setExportMode, setSanitizeMetadata,
  setVerifyOnExport, setVerificationReport, runStandaloneVerification,
  undo, redo, setActiveItem, setCurrentPage, setScale, exportPDF, resetEditor,
}: PDFEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showFontNote, setShowFontNote] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showStampModal, setShowStampModal] = useState(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(false); // Default closed on continuous scroll

  // Go To Page State
  const [showGoToPage, setShowGoToPage] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState('');
  const goToInputRef = useRef<HTMLInputElement>(null);

  // Find & Replace State
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);

  const {
    totalPages, currentPage, scale, textItems, activeItemId, activeRedactionId, activeSignatureId, activeStampId,
    activeTool, exportMode, sanitizeMetadata, verifyOnExport, verificationReport,
    isVerifying, isDirty, isExporting, error, pageDimensions = {}
  } = state;

  // Initialize edit values when page items arrive
  useEffect(() => {
    const vals: Record<string, string> = {};
    for (const items of Object.values(state.pageItems)) {
      items.forEach(item => { vals[item.id] = item.editedText; });
    }
    state.textItems.forEach(item => { vals[item.id] = item.editedText; });
    setEditValues(vals);
  }, [state.pageItems, state.textItems]);

  // Check if blackout redactions exist across document
  const hasBlackoutRedactions = Object.values(state.redactions)
    .some(list => list.some(box => box.type === 'blackout'));

  // Ensure export mode defaults to sanitized when blackout redaction exists
  useEffect(() => {
    if (hasBlackoutRedactions && state.exportMode !== 'sanitized') {
      setExportMode('sanitized');
    }
  }, [hasBlackoutRedactions, state.exportMode, setExportMode]);

  // ── Central Scroll To Page Navigation ───────────────────────────────────────
  const scrollToPage = useCallback((pageNum: number, options?: { behavior?: ScrollBehavior; highlightItemId?: string }) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    const pageEl = document.getElementById(`pdf-page-${pageNum}`);
    if (pageEl && containerRef.current) {
      pageEl.scrollIntoView({ behavior: options?.behavior ?? 'smooth', block: 'center' });
    }
    setCurrentPage(pageNum);
    if (options?.highlightItemId) {
      setActiveItem(options.highlightItemId);
    }
  }, [totalPages, setCurrentPage, setActiveItem]);

  // ── Viewport Scroll Tracking for Current Page Indicator ─────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalPages <= 0) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!container) return;
          const containerRect = container.getBoundingClientRect();
          const containerCenterY = containerRect.top + containerRect.height / 2;

          let bestPage = currentPage;
          let minDistance = Infinity;

          for (let p = 1; p <= totalPages; p++) {
            const pageEl = document.getElementById(`pdf-page-${p}`);
            if (pageEl) {
              const rect = pageEl.getBoundingClientRect();
              const pageCenterY = rect.top + rect.height / 2;
              const dist = Math.abs(pageCenterY - containerCenterY);
              if (dist < minDistance) {
                minDistance = dist;
                bestPage = p;
              }
            }
          }

          if (bestPage !== currentPage) {
            setCurrentPage(bestPage);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [totalPages, currentPage, setCurrentPage]);

  // ── Keyboard Shortcuts (Undo, Redo, Delete, GoToPage, Find) ─────────────────
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
          } else if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            setShowFindReplace(true);
          } else if (e.key === 'g' || e.key === 'G') {
            if (!isEditingInput) {
              e.preventDefault();
              setShowGoToPage(true);
              setGoToPageInput(String(currentPage));
              setTimeout(() => goToInputRef.current?.select(), 50);
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
        if (showFindReplace) {
          setShowFindReplace(false);
          setMatches([]);
          setCurrentMatchIndex(-1);
        }
        if (showGoToPage) {
          setShowGoToPage(false);
        }
        setActiveItem(null);
        setActiveRedaction(null);
        setActiveSignature(null);
        setActiveStamp(null);
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo, redo, state.activeRedactionId, state.activeSignatureId, state.activeStampId,
    showFindReplace, showGoToPage, currentPage, deleteRedactionBox, deleteSignature, deleteStamp,
    setActiveItem, setActiveRedaction, setActiveSignature, setActiveStamp, setActiveTool
  ]);

  // ── Zoom with Relative Scroll Preservation ──────────────────────────────────
  const zoom = (direction: 1 | -1) => {
    const currentViewPage = currentPage;
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round((scale + direction * SCALE_STEP) * 100) / 100));
    setScale(next);
    // After scale update, keep the current page centered
    setTimeout(() => {
      scrollToPage(currentViewPage, { behavior: 'instant' });
    }, 50);
  };

  // ── Text Item Interaction Callbacks ─────────────────────────────────────────
  const handleItemClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool !== 'select') return;
    setActiveRedaction(null);
    setActiveSignature(null);
    setActiveStamp(null);
    setActiveItem(id);
    beginTextEdit?.(id);
  };

  const handleItemTextChange = (id: string, newText: string) => {
    setEditValues(p => ({ ...p, [id]: newText }));
    updateTextWithoutHistory?.(id, newText);
  };

  const handleItemBlur = (id: string) => {
    commitTextEdit?.(id);
    setActiveItem(null);
  };

  // ── Find & Replace Match Navigation ─────────────────────────────────────────
  const handleNavigateToMatch = useCallback((match: SearchMatch) => {
    scrollToPage(match.pageNumber, { highlightItemId: match.itemId });
  }, [scrollToPage]);

  // ── Go To Page Submit Handler ───────────────────────────────────────────────
  const handleGoToPageSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = parseInt(goToPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      scrollToPage(target);
      setShowGoToPage(false);
    }
  };

  // Redactions, Signatures, and Stamps counts
  const allRedactionCount = Object.values(state.redactions).reduce((acc, list) => acc + list.length, 0);

  // Active item font details for font notice
  const allTextItemsList = Object.values(state.pageItems).flat();
  const activeItemObj = activeItemId ? (allTextItemsList.find(i => i.id === activeItemId) || textItems.find(i => i.id === activeItemId)) : null;

  return (
    <section id="editor" style={{ padding: '0 0 4rem', position: 'relative' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 1rem', position: 'relative' }}>

        {/* Top Control Toolbar */}
        <div className="card-glass" style={{
          borderRadius: '1rem 1rem 0 0',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Left: Thumbnail toggle & Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {/* Optional Thumbnail Sidebar Toggle Button */}
            <button
              className={`btn-icon ${isThumbnailsOpen ? 'active-tool' : ''}`}
              style={{
                height: 36,
                padding: '0 0.65rem',
                gap: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: isThumbnailsOpen ? 'rgba(77,107,250,0.25)' : 'rgba(255,255,255,0.06)',
                borderColor: isThumbnailsOpen ? '#4d6bfa' : 'rgba(255,255,255,0.1)',
                color: isThumbnailsOpen ? '#7c9aff' : '#f0f0f0',
              }}
              onClick={() => setIsThumbnailsOpen(p => !p)}
              title="Toggle page thumbnails overview"
            >
              <Layers size={14} />
              <span className="hidden sm:inline">Pages</span>
            </button>

            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', margin: '0 0.2rem' }} />

            {/* Select Tool */}
            <button
              className="btn-icon"
              style={{
                height: 36,
                padding: '0 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                background: activeTool === 'select' ? 'rgba(77,107,250,0.25)' : 'rgba(255,255,255,0.05)',
                borderColor: activeTool === 'select' ? '#4d6bfa' : 'rgba(255,255,255,0.1)',
                color: activeTool === 'select' ? '#7c9aff' : '#f0f0f0',
                fontWeight: activeTool === 'select' ? 700 : 500,
              }}
              onClick={() => {
                setActiveTool('select');
                setActiveRedaction(null);
                setActiveSignature(null);
                setActiveStamp(null);
              }}
              title="Select & Edit Mode (V)"
            >
              <MousePointer size={14} /> <span className="hidden md:inline">Select</span>
            </button>

            {/* Add Text Field Button */}
            <button
              className="btn-icon"
              style={{
                height: 36,
                padding: '0 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                background: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#f0f0f0',
              }}
              onClick={() => addTextField(currentPage)}
              title="Insert new editable text field on current page"
            >
              <Plus size={14} color="#4d6bfa" /> <span className="hidden md:inline">Add Text</span>
            </button>

            {/* Blackout Redaction Button */}
            <button
              className="btn-icon"
              style={{
                height: 36,
                padding: '0 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                background: activeTool === 'blackout' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.05)',
                borderColor: activeTool === 'blackout' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                color: activeTool === 'blackout' ? '#fca5a5' : '#f0f0f0',
                fontWeight: activeTool === 'blackout' ? 700 : 500,
              }}
              onClick={() => setActiveTool(activeTool === 'blackout' ? 'select' : 'blackout')}
              title="Draw Permanent Blackout Redaction Area"
            >
              <EyeOff size={14} color="#ef4444" /> <span className="hidden sm:inline">Blackout</span>
            </button>

            {/* Whiteout Eraser Button */}
            <button
              className="btn-icon"
              style={{
                height: 36,
                padding: '0 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                background: activeTool === 'whiteout' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.05)',
                borderColor: activeTool === 'whiteout' ? '#ffffff' : 'rgba(255,255,255,0.1)',
                color: activeTool === 'whiteout' ? '#ffffff' : '#f0f0f0',
                fontWeight: activeTool === 'whiteout' ? 700 : 500,
              }}
              onClick={() => setActiveTool(activeTool === 'whiteout' ? 'select' : 'whiteout')}
              title="Draw Whiteout Area Eraser"
            >
              <Eraser size={14} color="#ffffff" /> <span className="hidden sm:inline">Whiteout</span>
            </button>

            {/* Digital Signature Modal Trigger */}
            <button
              className="btn-icon"
              style={{
                height: 36,
                padding: '0 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                background: showSignatureModal ? 'rgba(77,107,250,0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#f0f0f0',
              }}
              onClick={() => setShowSignatureModal(true)}
              title="Draw, type, or upload a digital signature"
            >
              <PenTool size={14} color="#4d6bfa" /> <span className="hidden md:inline">Sign</span>
            </button>

            {/* Official Stamp Modal Trigger */}
            <button
              className="btn-icon"
              style={{
                height: 36,
                padding: '0 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                background: showStampModal ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#f0f0f0',
              }}
              onClick={() => setShowStampModal(true)}
              title="Insert official approval stamps or custom PNG/JPG images"
            >
              <Tag size={14} color="#4ade80" /> <span className="hidden md:inline">Stamp</span>
            </button>

            {/* Find & Replace Trigger */}
            <button
              className="btn-icon"
              style={{
                height: 36,
                padding: '0 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                background: showFindReplace ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.05)',
                borderColor: showFindReplace ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                color: showFindReplace ? '#fbbf24' : '#f0f0f0',
              }}
              onClick={() => setShowFindReplace(p => !p)}
              title="Find and Replace text across all pages (Ctrl+F)"
            >
              <Search size={14} /> <span className="hidden lg:inline">Find & Replace</span>
            </button>
          </div>

          {/* Right: Security Badge, Zoom, Redaction audit, Export & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {/* Security Status Badge */}
            <SecurityStatusBadge
              redactionsCount={allRedactionCount}
              exportMode={exportMode}
              verificationReport={verificationReport}
              hasBlackoutRedactions={hasBlackoutRedactions}
            />

            {/* Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
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

            {/* Redaction Verification Quick Action Button */}
            {isDirty && (
              <button
                className="btn-secondary hidden lg:flex"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
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
                {isVerifying ? 'Auditing…' : 'Verify'}
              </button>
            )}

            {/* Font notice */}
            <button
              className="btn-icon"
              style={{ width: 32, height: 32, position: 'relative' }}
              onClick={() => setShowFontNote(p => !p)}
              title="Font notice and inspection"
            >
              <Info size={14} />
              {showFontNote && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem', padding: '0.75rem 1rem', width: 280,
                  fontSize: '0.75rem', color: 'rgba(240,240,240,0.7)',
                  textAlign: 'left', lineHeight: 1.6, zIndex: 100,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}>
                  <strong style={{ color: '#f0f0f0', display: 'block', marginBottom: '0.25rem' }}>PDF Font Compatibility:</strong>
                  <div>Edited text uses standard PDF fonts (Helvetica, Times-Roman, Courier).</div>
                  {activeItemObj && (
                    <div style={{ marginTop: '0.35rem', padding: '0.35rem', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                      <div><strong>Original font:</strong> {activeItemObj.fontName || 'Embedded PDF Font'}</div>
                      <div><strong>Editing font:</strong> {activeItemObj.format.fontFamily}</div>
                    </div>
                  )}
                </div>
              )}
            </button>

            {/* Reset */}
            <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={resetEditor}>
              <RotateCcw size={13} /> <span className="hidden sm:inline">New PDF</span>
            </button>

            {/* Export / Download Button */}
            <button
              className="btn-primary"
              style={{ padding: '0.45rem 1.15rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setShowExportModal(true)}
              disabled={!isDirty || isExporting}
              title={!isDirty ? 'Make some edits first' : 'Download edited PDF'}
            >
              {isExporting ? (
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
              ) : <Download size={14} />}
              <span>Download</span>
            </button>

            {/* Close */}
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={resetEditor} aria-label="Close editor">
              <X size={14} />
            </button>
          </div>
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
              <strong>{activeTool === 'blackout' ? '⬛ Blackout Redaction Mode:' : '⬜ Whiteout Mode:'}</strong> Click and drag on any PDF page to create a redaction zone.
            </span>
            <button
              onClick={() => setActiveTool('select')}
              style={{ background: 'transparent', border: 'none', color: 'rgba(240,240,240,0.6)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Cancel (Esc)
            </button>
          </div>
        )}

        {/* Main Work Area: Optional Sidebar + Continuous Document Scroll Container */}
        <div style={{ display: 'flex', position: 'relative', width: '100%', minHeight: '75vh' }}>
          {/* Optional Left Thumbnails Sidebar / Drawer */}
          {isThumbnailsOpen && (
            <PageThumbnailsSidebar
              isOpen={isThumbnailsOpen}
              onToggle={() => setIsThumbnailsOpen(false)}
              totalPages={totalPages}
              currentPage={currentPage}
              onSelectPage={pageNum => scrollToPage(pageNum)}
              pageItems={state.pageItems}
              redactions={state.redactions}
              signatures={state.signatures}
              stamps={state.stamps}
            />
          )}

          {/* Continuous Document Scroll Viewport */}
          <div
            ref={containerRef}
            className="document-scroll-container card-glass"
            style={{
              flex: 1,
              borderRadius: isThumbnailsOpen ? '0 0 1rem 0' : '0 0 1rem 1rem',
              padding: '1.5rem 1rem',
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: '80vh',
              position: 'relative',
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
            {/* Floating Find & Replace Toolbar */}
            <FindReplaceBar
              isOpen={showFindReplace}
              onClose={() => {
                setShowFindReplace(false);
                setMatches([]);
                setCurrentMatchIndex(-1);
              }}
              onSearch={searchDocumentMatches}
              onReplaceCurrent={(match, repText) => replaceSingleMatch(match, repText)}
              onReplaceAll={replaceAllMatches}
              onRedactAll={redactAllMatches}
              onNavigateToMatch={handleNavigateToMatch}
              currentMatchIndex={currentMatchIndex}
              matches={matches}
              setMatches={setMatches}
              setCurrentMatchIndex={setCurrentMatchIndex}
            />

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '1rem 1.25rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {/* Continuous Vertical Document Stack */}
            <div className="document-stack" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              paddingBottom: '4rem',
            }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <PDFPage
                  key={pageNum}
                  pageNumber={pageNum}
                  scale={scale}
                  pageDimension={pageDimensions[pageNum]}
                  renderPage={renderPage}
                  cancelPageRender={cancelPageRender}
                  textItems={state.pageItems[pageNum] || []}
                  redactions={state.redactions[pageNum] || []}
                  signatures={state.signatures[pageNum] || []}
                  stamps={state.stamps[pageNum] || []}
                  activeItemId={activeItemId}
                  activeRedactionId={activeRedactionId}
                  activeSignatureId={activeSignatureId}
                  activeStampId={activeStampId}
                  activeTool={activeTool}
                  setActiveItem={setActiveItem}
                  setActiveRedaction={setActiveRedaction}
                  setActiveSignature={setActiveSignature}
                  setActiveStamp={setActiveStamp}
                  setActiveTool={setActiveTool}
                  editValues={editValues}
                  onItemTextChange={handleItemTextChange}
                  onItemBlur={handleItemBlur}
                  onItemClick={handleItemClick}
                  updateFormat={updateFormat}
                  updatePosition={updatePosition}
                  deleteItem={deleteItem}
                  addRedactionBox={addRedactionBox}
                  updateRedactionBox={updateRedactionBox}
                  deleteRedactionBox={deleteRedactionBox}
                  updateSignature={updateSignature}
                  deleteSignature={deleteSignature}
                  updateStamp={updateStamp}
                  deleteStamp={deleteStamp}
                  matches={matches}
                  currentMatchIndex={currentMatchIndex}
                  scrollContainerRef={containerRef}
                />
              ))}
            </div>

            {/* Floating Current Page Indicator & Go To Page Control */}
            <div style={{
              position: 'sticky',
              bottom: '1.25rem',
              display: 'flex',
              justifyContent: 'flex-end',
              pointerEvents: 'none',
              zIndex: 90,
              paddingRight: '1rem',
            }}>
              <div
                className="page-indicator-pill"
                onClick={e => {
                  e.stopPropagation();
                  setShowGoToPage(p => !p);
                  setGoToPageInput(String(currentPage));
                  setTimeout(() => goToInputRef.current?.select(), 50);
                }}
                style={{
                  pointerEvents: 'auto',
                  background: 'rgba(15, 15, 26, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '2rem',
                  padding: '0.45rem 0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#f0f0f0',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
                title="Click to Go To Page (Ctrl+G)"
              >
                <span style={{ color: '#4d6bfa' }}>Page</span>
                <span style={{ color: '#fff' }}>{currentPage}</span>
                <span style={{ color: 'rgba(240,240,240,0.4)' }}>/</span>
                <span style={{ color: 'rgba(240,240,240,0.7)' }}>{totalPages}</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', marginLeft: '0.2rem' }}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      scrollToPage(Math.max(1, currentPage - 1));
                    }}
                    disabled={currentPage <= 1}
                    style={{ background: 'transparent', border: 'none', color: currentPage <= 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', cursor: currentPage <= 1 ? 'default' : 'pointer', padding: 2, display: 'flex' }}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      scrollToPage(Math.min(totalPages, currentPage + 1));
                    }}
                    disabled={currentPage >= totalPages}
                    style={{ background: 'transparent', border: 'none', color: currentPage >= totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', cursor: currentPage >= totalPages ? 'default' : 'pointer', padding: 2, display: 'flex' }}
                    aria-label="Next page"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Go To Page Popover Modal */}
            {showGoToPage && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10000,
                }}
                onClick={() => setShowGoToPage(false)}
              >
                <div
                  className="card-glass"
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: 280,
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
                    border: '1px solid rgba(77,107,250,0.4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#f0f0f0' }}>Go to Page</strong>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.4)' }}>1 – {totalPages}</span>
                  </div>

                  <form onSubmit={handleGoToPageSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      ref={goToInputRef}
                      type="number"
                      min={1}
                      max={totalPages}
                      value={goToPageInput}
                      onChange={e => setGoToPageInput(e.target.value)}
                      placeholder={`1..${totalPages}`}
                      autoFocus
                      className="input-dark"
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        fontWeight: 700,
                      }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
                    >
                      <span>Go</span> <ArrowRight size={13} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Placement Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onInsert={(dataUrl, width, height) => {
          const defaultWidth = (width || 180) * scale;
          const defaultHeight = (height || 65) * scale;
          const defaultX = 100;
          const defaultY = 150;

          addSignature({
            dataUrl,
            x: defaultX,
            y: defaultY,
            width: defaultWidth,
            height: defaultHeight,
            pageIndex: currentPage,
          });
        }}
      />

      {/* Official Stamps & Image Inserter Modal */}
      <StampModal
        isOpen={showStampModal}
        onClose={() => setShowStampModal(false)}
        onInsert={(dataUrl, width, height, rotation, opacity, label) => {
          const defaultX = 120;
          const defaultY = 160;

          addStamp({
            type: label ? 'preset-stamp' : 'custom-image',
            dataUrl,
            label,
            x: defaultX,
            y: defaultY,
            width: (width || 140) * scale,
            height: (height || 48) * scale,
            rotation: rotation || 0,
            opacity: opacity ?? 0.95,
            pageIndex: currentPage,
          });
        }}
      />

      {/* Export / Download Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1.5rem',
        }}>
          <div className="card-glass" style={{
            maxWidth: 580,
            width: '100%',
            borderRadius: '1.25rem',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>
                Export & Download PDF
              </h3>
              <button className="btn-icon" onClick={() => setShowExportModal(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Warning if Blackout Redactions exist */}
            {hasBlackoutRedactions && (
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
              }}>
                <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.5 }}>
                  <strong>Redaction detected:</strong> For privacy, this document must be exported using <strong>Permanent Sanitization</strong>. Vector overlays only draw visual boxes and do not remove underlying sensitive text streams.
                </div>
              </div>
            )}

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
                    <strong style={{ color: '#f0f0f0', fontSize: '0.92rem' }}>Permanent Sanitization (Flattened)</strong>
                    <span style={{ fontSize: '0.65rem', background: '#22c55e', color: '#000', padding: '0.15rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>RECOMMENDED</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.5 }}>
                    Renders pages at crisp 300 DPI high resolution and <strong>permanently destroys underlying text streams, OCR layers, and hidden vector objects</strong>.
                  </p>
                </div>
              </label>

              <label
                onClick={() => {
                  if (!hasBlackoutRedactions) {
                    setExportMode('vector');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '0.85rem',
                  background: exportMode === 'vector' ? 'rgba(77,107,250,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${exportMode === 'vector' ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                  cursor: hasBlackoutRedactions ? 'not-allowed' : 'pointer',
                  opacity: hasBlackoutRedactions ? 0.5 : 1,
                }}
              >
                <input
                  type="radio"
                  name="exportMode"
                  disabled={hasBlackoutRedactions}
                  checked={exportMode === 'vector'}
                  onChange={() => {
                    if (!hasBlackoutRedactions) setExportMode('vector');
                  }}
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#f0f0f0', fontSize: '0.92rem' }}>Standard Vector Overlay</strong>
                    {hasBlackoutRedactions && (
                      <span style={{ fontSize: '0.65rem', background: '#ef4444', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>DISABLED FOR REDACTION</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.5 }}>
                    Adds text, stamp & shape overlays on top of the original vector streams. Keeps text selectable in external viewers. <em>(Unsafe for confidential PII redactions)</em>.
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
                <span><strong>Redaction Verification Scan:</strong> Audit exported binary to verify redacted text is not found in extractable text.</span>
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
                    {verificationReport.auditNote || (verificationReport.passed
                      ? 'The exported PDF was scanned and the redacted terms were not found in extractable PDF text.'
                      : 'Sensitive redacted terms were detected in the underlying extractable text streams.')}
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
                  The exported PDF was scanned and the <strong>{verificationReport.checks.length} redacted phrase(s)</strong> were not found in extractable PDF text.
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
                    Recommended: Switch to Permanent Sanitization (Flattened) to permanently purge these text bytes.
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
