import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, PenTool, Type, Upload, Bookmark, RotateCcw, Trash2, Check, Sparkles
} from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (dataUrl: string, width: number, height: number) => void;
}

const INK_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'Navy Blue', value: '#1e40af' },
  { label: 'Crimson', value: '#dc2626' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 3.5 },
  { label: 'Bold', value: 5.5 },
];

const CURSIVE_FONTS = [
  { name: 'Dancing Script', label: 'Modern Script', font: "'Dancing Script', cursive" },
  { name: 'Caveat', label: 'Natural Handwriting', font: "'Caveat', cursive" },
  { name: 'Great Vibes', label: 'Calligraphy', font: "'Great Vibes', cursive" },
  { name: 'Brush Script', label: 'Formal Signature', font: "'Brush Script MT', cursive, sans-serif" },
];

const LOCAL_STORAGE_KEY = 'editpdf_saved_signatures';

export default function SignatureModal({ isOpen, onClose, onInsert }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload' | 'saved'>('draw');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3.5);
  const [saveToLocalStorage, setSaveToLocalStorage] = useState(true);

  // Draw Tab State
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Type Tab State
  const [typedName, setTypedName] = useState('John Doe');
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);

  // Upload Tab State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved Signatures State
  const [savedSignatures, setSavedSignatures] = useState<{ id: string; dataUrl: string; date: string }[]>([]);

  // Load saved signatures from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedSignatures(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }, [isOpen]);

  const saveSignatureToStorage = (dataUrl: string) => {
    if (!saveToLocalStorage) return;
    try {
      const newEntry = {
        id: `sig-${Date.now()}`,
        dataUrl,
        date: new Date().toLocaleDateString(),
      };
      const updated = [newEntry, ...savedSignatures.slice(0, 7)]; // keep up to 8
      setSavedSignatures(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const removeSavedSignature = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = savedSignatures.filter(s => s.id !== id);
      setSavedSignatures(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  // Initialize Canvas
  useEffect(() => {
    if (activeTab === 'draw' && drawCanvasRef.current) {
      const canvas = drawCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && history.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeTab, history.length]);

  // ── DRAW TAB LOGIC ──────────────────────────────────────────────────────────
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save snapshot for undo
    setHistory(prev => [...prev.slice(-9), ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    const pos = getCanvasPos(e);
    setIsDrawing(true);
    setHasDrawn(true);
    lastPointRef.current = pos;
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return;
    e.preventDefault();
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCanvasPos(e);
    const lastPos = lastPointRef.current;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = strokeWidth * 2; // high-DPI scaling
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    const midX = (lastPos.x + currentPos.x) / 2;
    const midY = (lastPos.y + currentPos.y) / 2;
    ctx.quadraticCurveTo(lastPos.x, lastPos.y, midX, midY);
    ctx.stroke();

    lastPointRef.current = currentPos;
  };

  const endDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setHistory([]);
  };

  const undoStroke = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
    if (history.length <= 1) setHasDrawn(false);
  };

  // Helper to trim transparent pixels around signature for tight bounding box
  const cropCanvasToContent = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 10) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) return canvas.toDataURL('image/png');

    const padding = 15;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(w, maxX + padding);
    maxY = Math.min(h, maxY + padding);

    const cropW = maxX - minX;
    const cropH = maxY - minY;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return canvas.toDataURL('image/png');

    cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropCanvas.toDataURL('image/png');
  };

  // ── TYPE TAB RENDERER ───────────────────────────────────────────────────────
  const renderTypedSignature = useCallback((): string => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 700;
    offCanvas.height = 240;
    const ctx = offCanvas.getContext('2d')!;

    const selectedFont = CURSIVE_FONTS[selectedFontIndex].font;
    ctx.font = `64px ${selectedFont}`;
    ctx.fillStyle = selectedColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillText(typedName || 'Your Signature', offCanvas.width / 2, offCanvas.height / 2);
    return cropCanvasToContent(offCanvas);
  }, [typedName, selectedFontIndex, selectedColor]);

  // ── UPLOAD TAB LOGIC (Auto-removes white paper background) ──────────────────
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsProcessingUpload(true);

    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const ctx = offCanvas.getContext('2d')!;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imgData.data;

        // Auto-remove paper background: if pixel is close to white, make alpha transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

          if (luminance > 215) {
            data[i + 3] = 0; // 100% transparent
          } else {
            // Enhance contrast for signature ink
            const factor = Math.max(0, 1 - luminance / 215);
            data[i + 3] = Math.min(255, Math.floor(factor * 255 * 1.5));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentPng = cropCanvasToContent(offCanvas);
        setUploadedImage(transparentPng);
        setIsProcessingUpload(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // ── HANDLE FINAL INSERT ────────────────────────────────────────────────────
  const handleInsertSignature = () => {
    let finalDataUrl = '';

    if (activeTab === 'draw') {
      if (!drawCanvasRef.current || !hasDrawn) return;
      finalDataUrl = cropCanvasToContent(drawCanvasRef.current);
    } else if (activeTab === 'type') {
      finalDataUrl = renderTypedSignature();
    } else if (activeTab === 'upload') {
      if (!uploadedImage) return;
      finalDataUrl = uploadedImage;
    }

    if (finalDataUrl) {
      saveSignatureToStorage(finalDataUrl);
      onInsert(finalDataUrl, 160, 65);
      onClose();
    }
  };

  const handleInsertSaved = (dataUrl: string) => {
    onInsert(dataUrl, 160, 65);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 12000,
      padding: '1.5rem',
    }}>
      <div className="card-glass" style={{
        maxWidth: 620,
        width: '100%',
        borderRadius: '1.25rem',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(77,107,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PenTool size={18} color="#4d6bfa" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>Add Digital Signature</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>100% In-Browser · Zero Server Upload</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          <button
            className={`btn-secondary ${activeTab === 'draw' ? 'btn-active' : ''}`}
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeTab === 'draw' ? 'rgba(77,107,250,0.2)' : 'transparent',
              borderColor: activeTab === 'draw' ? '#4d6bfa' : 'transparent',
              color: activeTab === 'draw' ? '#7c9aff' : 'rgba(240,240,240,0.7)',
            }}
            onClick={() => setActiveTab('draw')}
          >
            <PenTool size={13} /> Draw Signature
          </button>

          <button
            className={`btn-secondary ${activeTab === 'type' ? 'btn-active' : ''}`}
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeTab === 'type' ? 'rgba(77,107,250,0.2)' : 'transparent',
              borderColor: activeTab === 'type' ? '#4d6bfa' : 'transparent',
              color: activeTab === 'type' ? '#7c9aff' : 'rgba(240,240,240,0.7)',
            }}
            onClick={() => setActiveTab('type')}
          >
            <Type size={13} /> Type Signature
          </button>

          <button
            className={`btn-secondary ${activeTab === 'upload' ? 'btn-active' : ''}`}
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeTab === 'upload' ? 'rgba(77,107,250,0.2)' : 'transparent',
              borderColor: activeTab === 'upload' ? '#4d6bfa' : 'transparent',
              color: activeTab === 'upload' ? '#7c9aff' : 'rgba(240,240,240,0.7)',
            }}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={13} /> Upload Image
          </button>

          {savedSignatures.length > 0 && (
            <button
              className={`btn-secondary ${activeTab === 'saved' ? 'btn-active' : ''}`}
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: activeTab === 'saved' ? 'rgba(77,107,250,0.2)' : 'transparent',
                borderColor: activeTab === 'saved' ? '#4d6bfa' : 'transparent',
                color: activeTab === 'saved' ? '#7c9aff' : 'rgba(240,240,240,0.7)',
              }}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark size={13} /> Saved ({savedSignatures.length})
            </button>
          )}
        </div>

        {/* ── TAB CONTENT ── */}
        <div style={{ minHeight: 240 }}>
          {/* TAB 1: DRAW SIGNATURE */}
          {activeTab === 'draw' && (
            <div>
              {/* Canvas Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                {/* Ink Color Picker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)', marginRight: '0.2rem' }}>Color:</span>
                  {INK_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setSelectedColor(c.value)}
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: c.value,
                        border: selectedColor === c.value ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                        boxShadow: selectedColor === c.value ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
                        cursor: 'pointer',
                      }}
                      title={c.label}
                    />
                  ))}
                </div>

                {/* Stroke Thickness */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)', marginRight: '0.2rem' }}>Thickness:</span>
                  {STROKE_WIDTHS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setStrokeWidth(s.value)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.72rem',
                        borderRadius: 6,
                        background: strokeWidth === s.value ? 'rgba(77,107,250,0.25)' : 'rgba(255,255,255,0.05)',
                        border: strokeWidth === s.value ? '1px solid #4d6bfa' : '1px solid rgba(255,255,255,0.1)',
                        color: strokeWidth === s.value ? '#7c9aff' : 'rgba(240,240,240,0.7)',
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Canvas Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    className="btn-icon"
                    style={{ width: 28, height: 28 }}
                    onClick={undoStroke}
                    disabled={history.length === 0}
                    title="Undo stroke"
                  >
                    <RotateCcw size={12} />
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                    onClick={clearCanvas}
                    disabled={!hasDrawn}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Drawing Area */}
              <div style={{
                background: '#ffffff',
                borderRadius: '0.85rem',
                border: '2px dashed rgba(77,107,250,0.4)',
                position: 'relative',
                touchAction: 'none',
                overflow: 'hidden',
              }}>
                <canvas
                  ref={drawCanvasRef}
                  width={1100}
                  height={380}
                  onMouseDown={startDrawing}
                  onMouseMove={drawMove}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={drawMove}
                  onTouchEnd={endDrawing}
                  style={{
                    width: '100%',
                    height: 190,
                    display: 'block',
                    cursor: 'crosshair',
                  }}
                />
                {!hasDrawn && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(0,0,0,0.3)',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                  }}>
                    <span>Sign here with your mouse or finger</span>
                  </div>
                )}
                {/* Signature baseline guide line */}
                <div style={{
                  position: 'absolute',
                  bottom: 30,
                  left: '10%',
                  right: '10%',
                  height: 1,
                  background: 'rgba(0,0,0,0.1)',
                  pointerEvents: 'none',
                }} />
              </div>
            </div>
          )}

          {/* TAB 2: TYPE SIGNATURE */}
          {activeTab === 'type' && (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(240,240,240,0.6)', marginBottom: '0.35rem' }}>
                  Type Your Name:
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={typedName}
                    onChange={e => setTypedName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{
                      flex: 1,
                      padding: '0.6rem 1rem',
                      borderRadius: '0.65rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#f0f0f0',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                  {/* Ink Color Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {INK_COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setSelectedColor(c.value)}
                        style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: c.value,
                          border: selectedColor === c.value ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                          boxShadow: selectedColor === c.value ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
                          cursor: 'pointer',
                        }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Style Selection Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {CURSIVE_FONTS.map((font, idx) => (
                  <div
                    key={font.name}
                    onClick={() => setSelectedFontIndex(idx)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '0.75rem',
                      padding: '1rem 1.25rem',
                      border: selectedFontIndex === idx ? '2px solid #4d6bfa' : '2px solid transparent',
                      boxShadow: selectedFontIndex === idx ? '0 0 12px rgba(77,107,250,0.4)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 85,
                    }}
                  >
                    <div style={{
                      fontFamily: font.font,
                      fontSize: '1.65rem',
                      color: selectedColor,
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {typedName || 'Your Signature'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {font.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD SIGNATURE IMAGE */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              {!uploadedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    borderRadius: '1rem',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(77,107,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={20} color="#4d6bfa" />
                  </div>
                  <strong style={{ color: '#f0f0f0', fontSize: '0.95rem' }}>
                    {isProcessingUpload ? 'Removing Background…' : 'Click to Upload Signature Photo'}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(240,240,240,0.5)', maxWidth: 360 }}>
                    PNG, JPG, or WEBP. Our in-browser engine automatically strips paper backgrounds to create a clean, transparent signature.
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '0.85rem',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 140,
                  }}>
                    <img src={uploadedImage} alt="Uploaded Signature" style={{ maxHeight: 110, maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                    onClick={() => {
                      setUploadedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Upload Different Image
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED SIGNATURES */}
          {activeTab === 'saved' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', maxHeight: 240, overflowY: 'auto' }}>
                {savedSignatures.map(sig => (
                  <div
                    key={sig.id}
                    onClick={() => handleInsertSaved(sig.dataUrl)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '0.75rem',
                      padding: '0.75rem',
                      border: '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 80,
                    }}
                  >
                    <img src={sig.dataUrl} alt="Saved signature" style={{ maxHeight: 50, maxWidth: '100%', objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.25rem' }}>{sig.date}</span>
                    <button
                      onClick={e => removeSavedSignature(sig.id, e)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(239,68,68,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                      title="Delete signature"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Settings & Buttons */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {activeTab !== 'saved' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(240,240,240,0.7)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={saveToLocalStorage}
                onChange={e => setSaveToLocalStorage(e.target.checked)}
              />
              <span>Save for 1-click reuse across documents</span>
            </label>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: 'auto' }}>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {activeTab !== 'saved' && (
              <button
                className="btn-primary"
                style={{ padding: '0.55rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={handleInsertSignature}
                disabled={activeTab === 'draw' && !hasDrawn}
              >
                <Check size={14} /> Insert Signature
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
