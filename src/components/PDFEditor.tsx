import { useEffect, useRef, useState, useCallback } from 'react';
import { Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X, RotateCcw, Info, GripVertical, Plus } from 'lucide-react';
import type { PDFTextItem, TextFormat } from '../types/pdf';
import TextFormatToolbar from './TextFormatToolbar';

interface PDFEditorProps {
  state: {
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
  };
  renderPage: (canvas: HTMLCanvasElement, page: number, scale: number) => Promise<PDFTextItem[]>;
  updateText: (id: string, text: string) => void;
  updateFormat: (id: string, partial: Partial<TextFormat>) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  deleteItem: (id: string) => void;
  addTextField: () => void;
  undo: () => void;
  redo: () => void;
  setActiveItem: (id: string | null) => void;
  setCurrentPage: (page: number) => void;
  setScale: (scale: number) => void;
  exportPDF: () => void;
  resetEditor: () => void;
}

const SCALE_STEP = 0.25;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

export default function PDFEditor({
  state, renderPage, updateText, updateFormat, updatePosition, deleteItem, addTextField, undo, redo,
  setActiveItem, setCurrentPage, setScale, exportPDF, resetEditor,
}: PDFEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showFontNote, setShowFontNote] = useState(false);

  // Dragging State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  // Render page when page/scale changes
  useEffect(() => {
    if (!canvasRef.current || state.totalPages === 0) return;
    renderPage(canvasRef.current, state.currentPage, state.scale);
    setEditValues({});
  }, [state.currentPage, state.scale, state.totalPages]);

  // Initialize edit values when textItems arrive
  useEffect(() => {
    const vals: Record<string, string> = {};
    state.textItems.forEach(item => { vals[item.id] = item.editedText; });
    setEditValues(vals);
  }, [state.textItems]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey) {
          // Ctrl+Shift+Z = Redo
          if (e.key === 'z' || e.key === 'Z') {
            e.preventDefault();
            redo();
          }
        } else {
          // Ctrl+Z = Undo
          if (e.key === 'z' || e.key === 'Z') {
            const activeEl = document.activeElement;
            const isEditingInput = activeEl && activeEl.classList.contains('text-overlay-input');
            // If they are currently typing, let the input's native undo system handle it
            if (!isEditingInput) {
              e.preventDefault();
              undo();
            }
          } else if (e.key === 'y' || e.key === 'Y') {
            // Ctrl+Y = Redo
            const activeEl = document.activeElement;
            const isEditingInput = activeEl && activeEl.classList.contains('text-overlay-input');
            if (!isEditingInput) {
              e.preventDefault();
              redo();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Handle Drag Move Action
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

  // Global Mouse listeners for dragging to prevent sticky/laggy drags
  useEffect(() => {
    if (!draggingId || !dragStartRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const start = dragStartRef.current;
      if (!start) return;

      const deltaX = e.clientX - start.mouseX;
      const deltaY = e.clientY - start.mouseY;

      const canvas = canvasRef.current;
      const canvasWidth = canvas ? canvas.width : 2000;
      const canvasHeight = canvas ? canvas.height : 2000;

      const item = state.textItems.find(i => i.id === draggingId);
      if (!item) return;

      // Keep within canvas boundary margins
      const newX = Math.max(0, Math.min(canvasWidth - item.width, start.startX + deltaX));
      const newY = Math.max(0, Math.min(canvasHeight - item.height, start.startY + deltaY));

      setDragPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      const start = dragStartRef.current;
      if (start && dragPosition) {
        const hasMoved = Math.abs(dragPosition.x - start.startX) > 0.5 || Math.abs(dragPosition.y - start.startY) > 0.5;
        if (hasMoved) {
          updatePosition(draggingId, dragPosition.x, dragPosition.y);
        }
      }
      setDraggingId(null);
      setDragPosition(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragPosition, state.textItems, updatePosition]);

  const handleItemClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveItem(id);
  }, [setActiveItem]);

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

  const { totalPages, currentPage, scale, textItems, activeItemId, isDirty, isLoading, isExporting, error } = state;

  return (
    <section id="editor" style={{ padding: '0 0 4rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Toolbar */}
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

          {/* Add Text */}
          <button
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: 'rgba(77, 107, 250, 0.15)',
              borderColor: 'rgba(77, 107, 250, 0.3)',
              color: '#4d6bfa',
              fontWeight: 600,
            }}
            onClick={addTextField}
            title="Add new text block"
          >
            <Plus size={13} /> Add Text
          </button>

          {/* Reset */}
          <button className="btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }} onClick={resetEditor}>
            <RotateCcw size={13} /> New PDF
          </button>

          {/* Export */}
          <button
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={exportPDF}
            disabled={!isDirty || isExporting}
            title={!isDirty ? 'Make some edits first' : 'Download edited PDF'}
          >
            {isExporting ? (
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
            ) : <Download size={14} />}
            {isExporting ? 'Exporting…' : 'Download PDF'}
          </button>

          {/* Close */}
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={resetEditor} aria-label="Close editor">
            <X size={14} />
          </button>
        </div>

        {/* Canvas + text overlay area */}
        <div
          className="card-glass"
          style={{
            borderRadius: '0 0 1rem 1rem',
            padding: '1.5rem',
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: '75vh',
            cursor: 'default',
          }}
          onClick={() => setActiveItem(null)}
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
              {/* Canvas wrapper — text overlays positioned absolutely inside */}
              <div className="pdf-canvas-wrapper" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
                <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 4 }} />

                {/* White cover-up boxes for deleted or moved text items (blocks original text in preview) */}
                {textItems.map(item => {
                  if (item.isAdded) return null; // Added items have no original text to cover up!
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

                {/* Text overlays (hide deleted ones) */}
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
                          {/* Left side drag handle */}
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
                            const toolbarWidth = 380; // Estimated toolbar width
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
                          {/* Editable input — grows with content via size attribute */}
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
                              fontFamily: item.format.fontFamily === 'helvetica' ? 'Helvetica, Arial, sans-serif' : item.format.fontFamily === 'times' ? 'Georgia, "Times New Roman", Times, serif' : '"Courier New", Courier, monospace',
                              color: item.format.color,
                            }}
                          />
                        </>
                      ) : hasChanges ? (
                        /* Show new text visibly — no clipping */
                        <span style={{
                          display: 'block',
                          width: 'max-content',
                          fontSize: item.fontSize + item.format.fontSizeDelta,
                          lineHeight: 1,
                          color: item.format.color,
                          fontWeight: item.format.bold ? 'bold' : 'normal',
                          fontStyle: item.format.italic ? 'italic' : 'normal',
                          textDecoration: item.format.underline ? 'underline' : 'none',
                          fontFamily: item.format.fontFamily === 'helvetica' ? 'Helvetica, Arial, sans-serif' : item.format.fontFamily === 'times' ? 'Georgia, "Times New Roman", Times, serif' : '"Courier New", Courier, monospace',
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                          padding: '0 2px',
                        }}>
                          {currentVal}
                        </span>
                      ) : (
                        /* Transparent hover zone for unedited text */
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

        {/* Edit count badge */}
        {isDirty && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(240,240,240,0.45)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4d6bfa', display: 'inline-block', boxShadow: '0 0 6px #4d6bfa' }} />
            {textItems.filter(i => (editValues[i.id] ?? i.editedText) !== i.originalText || i.isDeleted || Math.abs(i.x - i.originalX) > 0.5 || Math.abs(i.y - i.originalY) > 0.5).length} text{' '}
            {textItems.filter(i => (editValues[i.id] ?? i.editedText) !== i.originalText || i.isDeleted || Math.abs(i.x - i.originalX) > 0.5 || Math.abs(i.y - i.originalY) > 0.5).length === 1 ? 'field' : 'fields'} modified
            {' · '}Ready to download (Ctrl+Z to Undo, Ctrl+Y to Redo)
          </div>
        )}
      </div>
    </section>
  );
}
