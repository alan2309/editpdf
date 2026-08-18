import React, { useState, useRef } from 'react';
import {
  X, Check, Upload, Tag, CheckSquare, Sparkles
} from 'lucide-react';

interface StampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (dataUrl: string, width: number, height: number, rotation: number, opacity: number, label?: string) => void;
}

interface PresetStamp {
  label: string;
  color: string;
  rotation: number;
  borderStyle: 'double' | 'solid' | 'dashed';
}

const PRESET_STATUS_STAMPS: PresetStamp[] = [
  { label: 'APPROVED', color: '#16a34a', rotation: -12, borderStyle: 'double' },
  { label: 'PAID', color: '#2563eb', rotation: -15, borderStyle: 'double' },
  { label: 'CONFIDENTIAL', color: '#dc2626', rotation: -10, borderStyle: 'double' },
  { label: 'VOID', color: '#7c3aed', rotation: -15, borderStyle: 'double' },
  { label: 'DRAFT', color: '#ea580c', rotation: -15, borderStyle: 'dashed' },
  { label: 'REJECTED', color: '#b91c1c', rotation: -15, borderStyle: 'double' },
  { label: 'COMPLETED', color: '#0d9488', rotation: -10, borderStyle: 'solid' },
  { label: 'URGENT', color: '#e11d48', rotation: -12, borderStyle: 'double' },
  { label: 'FINAL', color: '#059669', rotation: -12, borderStyle: 'double' },
  { label: 'COPY', color: '#475569', rotation: -15, borderStyle: 'solid' },
];

const SYMBOL_MARKS = [
  { id: 'check-green', label: '✓ Checkmark (Green)', symbol: '✓', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', width: 48, height: 48 },
  { id: 'check-black', label: '✓ Checkmark (Black)', symbol: '✓', color: '#000000', bg: 'rgba(0,0,0,0.06)', width: 48, height: 48 },
  { id: 'check-blue', label: '✓ Checkmark (Blue)', symbol: '✓', color: '#2563eb', bg: 'rgba(37,99,235,0.1)', width: 48, height: 48 },
  { id: 'cross-red', label: '✗ Crossmark (Red)', symbol: '✗', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', width: 48, height: 48 },
  { id: 'sign-here', label: '👉 SIGN HERE Badge', text: '👉 SIGN HERE', color: '#dc2626', bg: '#fef08a', width: 140, height: 42 },
  { id: 'initial-here', label: 'INITIAL [____]', text: 'INITIAL [____]', color: '#1e40af', bg: 'transparent', width: 130, height: 38 },
  { id: 'date-stamp', label: 'DATE: ________', text: `DATE: ${new Date().toLocaleDateString()}`, color: '#334155', bg: 'transparent', width: 150, height: 38 },
];

export default function StampModal({ isOpen, onClose, onInsert }: StampModalProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'symbols' | 'custom' | 'upload'>('status');

  // Custom Stamp State
  const [customText, setCustomText] = useState('VERIFIED');
  const [customColor, setCustomColor] = useState('#16a34a');
  const [customBorder, setCustomBorder] = useState<'double' | 'solid' | 'dashed'>('double');
  const [customRotation, setCustomRotation] = useState(-12);
  const [customOpacity, setCustomOpacity] = useState(0.9);

  // Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // ── Canvas Generator for Rubber Stamp Effect ───────────────────────────────
  const generateStampDataUrl = (
    text: string,
    color: string,
    borderStyle: 'double' | 'solid' | 'dashed',
    opacity = 0.95
  ): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 460;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = opacity;

    const pad = 12;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;
    const r = 16; // border radius

    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // Helper for rounded rectangle path
    const drawRoundRect = (x: number, y: number, rw: number, rh: number, rad: number) => {
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.lineTo(x + rw - rad, y);
      ctx.quadraticCurveTo(x + rw, y, x + rw, y + rad);
      ctx.lineTo(x + rw, y + rh - rad);
      ctx.quadraticCurveTo(x + rw, y + rh, x + rw - rad, y + rh);
      ctx.lineTo(x + rad, y + rh);
      ctx.quadraticCurveTo(x, y + rh, x, y + rh - rad);
      ctx.lineTo(x, y + rad);
      ctx.quadraticCurveTo(x, y, x + rad, y);
      ctx.closePath();
    };

    if (borderStyle === 'double') {
      // Outer border
      ctx.lineWidth = 6;
      drawRoundRect(pad, pad, w, h, r);
      ctx.stroke();

      // Inner border
      ctx.lineWidth = 2.5;
      drawRoundRect(pad + 7, pad + 7, w - 14, h - 14, r - 4);
      ctx.stroke();
    } else if (borderStyle === 'dashed') {
      ctx.lineWidth = 5;
      ctx.setLineDash([12, 6]);
      drawRoundRect(pad, pad, w, h, r);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // Solid border
      ctx.lineWidth = 6;
      drawRoundRect(pad, pad, w, h, r);
      ctx.stroke();
    }

    // Stamp text in all-caps bold typeface
    ctx.font = '900 52px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Auto-fit text if long
    let fontSize = 52;
    while (ctx.measureText(text.toUpperCase()).width > w - 30 && fontSize > 24) {
      fontSize -= 4;
      ctx.font = `900 ${fontSize}px "Arial Black", Impact, sans-serif`;
    }

    ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  };

  // ── Canvas Generator for Checklist & Symbols ──────────────────────────────
  const generateSymbolDataUrl = (symbolItem: typeof SYMBOL_MARKS[0]): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = symbolItem.height > 40 ? 100 : 240;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (symbolItem.symbol) {
      // Single checkmark or crossmark
      ctx.font = 'bold 150px Arial, sans-serif';
      ctx.fillStyle = symbolItem.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbolItem.symbol, canvas.width / 2, canvas.height / 2);
    } else if (symbolItem.text) {
      // Badge / Text Symbol (e.g. "👉 SIGN HERE")
      if (symbolItem.bg !== 'transparent') {
        ctx.fillStyle = symbolItem.bg;
        ctx.beginPath();
        ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 12);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = symbolItem.color;
        ctx.stroke();
      } else {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = symbolItem.color;
        ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
      }

      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.fillStyle = symbolItem.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbolItem.text, canvas.width / 2, canvas.height / 2);
    }

    return canvas.toDataURL('image/png');
  };

  // ── Auto Background Removal for Scans & Logos ──────────────────────────────
  const processImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsProcessingUpload(true);

    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      if (!autoRemoveBg) {
        setUploadedImage(src);
        setIsProcessingUpload(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const ctx = offCanvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

          if (luminance > 220) {
            data[i + 3] = 0; // Transparent
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setUploadedImage(offCanvas.toDataURL('image/png'));
        setIsProcessingUpload(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetStamp = (stamp: PresetStamp) => {
    const dataUrl = generateStampDataUrl(stamp.label, stamp.color, stamp.borderStyle, 0.92);
    onInsert(dataUrl, 165, 58, stamp.rotation, 0.92, stamp.label);
    onClose();
  };

  const handleSelectSymbol = (sym: typeof SYMBOL_MARKS[0]) => {
    const dataUrl = generateSymbolDataUrl(sym);
    onInsert(dataUrl, sym.width, sym.height, 0, 1.0, sym.label);
    onClose();
  };

  const handleInsertCustomStamp = () => {
    if (!customText.trim()) return;
    const dataUrl = generateStampDataUrl(customText.trim(), customColor, customBorder, customOpacity);
    onInsert(dataUrl, 165, 58, customRotation, customOpacity, customText.trim());
    onClose();
  };

  const handleInsertUploadedImage = () => {
    if (!uploadedImage) return;
    onInsert(uploadedImage, 140, 100, 0, 1.0, 'Uploaded Image');
    onClose();
  };

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
        maxWidth: 680,
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
              <Tag size={18} color="#4d6bfa" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>Insert Stamp, Image & Symbol</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>100% In-Browser · Official Status Stamps & Logos</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className={`btn-secondary ${activeTab === 'status' ? 'btn-active' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeTab === 'status' ? 'rgba(77,107,250,0.2)' : 'transparent',
              borderColor: activeTab === 'status' ? '#4d6bfa' : 'transparent',
              color: activeTab === 'status' ? '#7c9aff' : 'rgba(240,240,240,0.7)',
            }}
            onClick={() => setActiveTab('status')}
          >
            <Tag size={13} /> Status Stamps
          </button>

          <button
            className={`btn-secondary ${activeTab === 'symbols' ? 'btn-active' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeTab === 'symbols' ? 'rgba(77,107,250,0.2)' : 'transparent',
              borderColor: activeTab === 'symbols' ? '#4d6bfa' : 'transparent',
              color: activeTab === 'symbols' ? '#7c9aff' : 'rgba(240,240,240,0.7)',
            }}
            onClick={() => setActiveTab('symbols')}
          >
            <CheckSquare size={13} /> Checkmarks & Marks
          </button>

          <button
            className={`btn-secondary ${activeTab === 'custom' ? 'btn-active' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeTab === 'custom' ? 'rgba(77,107,250,0.2)' : 'transparent',
              borderColor: activeTab === 'custom' ? '#4d6bfa' : 'transparent',
              color: activeTab === 'custom' ? '#7c9aff' : 'rgba(240,240,240,0.7)',
            }}
            onClick={() => setActiveTab('custom')}
          >
            <Sparkles size={13} /> Custom Stamp
          </button>

          <button
            className={`btn-secondary ${activeTab === 'upload' ? 'btn-active' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
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
            <Upload size={13} /> Upload Logo / Image
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: 260 }}>
          {/* TAB 1: PRESET STATUS STAMPS */}
          {activeTab === 'status' && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(240,240,240,0.5)', marginBottom: '0.85rem' }}>
                Click any rubber stamp below to insert onto the current page. You can drag, scale, and adjust angle anytime.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.85rem', maxHeight: 250, overflowY: 'auto', padding: '0.25rem' }}>
                {PRESET_STATUS_STAMPS.map(stamp => (
                  <button
                    key={stamp.label}
                    onClick={() => handleSelectPresetStamp(stamp)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `2px ${stamp.borderStyle === 'dashed' ? 'dashed' : 'solid'} ${stamp.color}`,
                      borderRadius: 10,
                      padding: '0.85rem 0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `rotate(${stamp.rotation}deg)`,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = `rotate(${stamp.rotation}deg) scale(1.05)`;
                      e.currentTarget.style.boxShadow = `0 0 12px ${stamp.color}55`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = `rotate(${stamp.rotation}deg)`;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{
                      fontWeight: 900,
                      fontSize: '0.88rem',
                      letterSpacing: '0.05em',
                      color: stamp.color,
                      fontFamily: '"Arial Black", Impact, sans-serif',
                    }}>
                      {stamp.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CHECKMARKS & FORM MARKS */}
          {activeTab === 'symbols' && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(240,240,240,0.5)', marginBottom: '0.85rem' }}>
                Click any symbol or indicator badge to insert onto checkboxes, signature lines, or audit forms.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.85rem', maxHeight: 250, overflowY: 'auto' }}>
                {SYMBOL_MARKS.map(sym => (
                  <button
                    key={sym.id}
                    onClick={() => handleSelectSymbol(sym)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      padding: '0.75rem 0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      minHeight: 75,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#4d6bfa';
                      e.currentTarget.style.background = 'rgba(77,107,250,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    {sym.symbol ? (
                      <span style={{ fontSize: '2rem', color: sym.color, lineHeight: 1, fontWeight: 900 }}>
                        {sym.symbol}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: sym.color, background: sym.bg, padding: '0.2rem 0.4rem', borderRadius: 4 }}>
                        {sym.text}
                      </span>
                    )}
                    <span style={{ fontSize: '0.68rem', color: 'rgba(240,240,240,0.5)' }}>{sym.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM STAMP CREATOR */}
          {activeTab === 'custom' && (
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(240,240,240,0.6)', marginBottom: '0.3rem' }}>
                    Stamp Text (e.g. RECEIVED, AUDITED):
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder="ENTER STAMP TEXT"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '0.6rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#f0f0f0',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(240,240,240,0.6)', marginBottom: '0.3rem' }}>
                    Color:
                  </label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {['#16a34a', '#2563eb', '#dc2626', '#7c3aed', '#ea580c', '#000000'].map(c => (
                      <button
                        key={c}
                        onClick={() => setCustomColor(c)}
                        style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: c,
                          border: customColor === c ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                          boxShadow: customColor === c ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Border Style */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.6)' }}>Border:</span>
                  {(['double', 'solid', 'dashed'] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setCustomBorder(b)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.75rem',
                        borderRadius: 6,
                        background: customBorder === b ? 'rgba(77,107,250,0.25)' : 'rgba(255,255,255,0.05)',
                        border: customBorder === b ? '1px solid #4d6bfa' : '1px solid rgba(255,255,255,0.1)',
                        color: customBorder === b ? '#7c9aff' : 'rgba(240,240,240,0.7)',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.6)' }}>Angle: {customRotation}°</span>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={customRotation}
                    onChange={e => setCustomRotation(Number(e.target.value))}
                    style={{ width: 80 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.6)' }}>Opacity: {Math.round(customOpacity * 100)}%</span>
                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    value={customOpacity}
                    onChange={e => setCustomOpacity(Number(e.target.value))}
                    style={{ width: 80 }}
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div style={{
                background: '#ffffff',
                borderRadius: '0.85rem',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 110,
                marginBottom: '1rem',
              }}>
                <div style={{
                  border: `4px ${customBorder === 'dashed' ? 'dashed' : 'solid'} ${customColor}`,
                  borderRadius: 12,
                  padding: '0.65rem 1.5rem',
                  transform: `rotate(${customRotation}deg)`,
                  color: customColor,
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  letterSpacing: '0.05em',
                }}>
                  {customText || 'STAMP PREVIEW'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD LOGO / IMAGE */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) processImageUpload(file);
                }}
              />

              {!uploadedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) processImageUpload(file);
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
                    {isProcessingUpload ? 'Processing Image…' : 'Click to Upload Company Logo or Image'}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(240,240,240,0.5)', maxWidth: 360 }}>
                    PNG, JPG, SVG, or WEBP. You can scale, rotate, and position it anywhere on the document.
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
                    minHeight: 130,
                  }}>
                    <img src={uploadedImage} alt="Uploaded logo" style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                    onClick={() => {
                      setUploadedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Upload Different Logo
                  </button>
                </div>
              )}

              <div style={{ marginTop: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(240,240,240,0.7)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoRemoveBg}
                    onChange={e => setAutoRemoveBg(e.target.checked)}
                  />
                  <span>Auto-remove white background (for scanned stamps & seals)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {activeTab === 'custom' && (
            <button
              className="btn-primary"
              style={{ padding: '0.55rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={handleInsertCustomStamp}
            >
              <Check size={14} /> Insert Custom Stamp
            </button>
          )}
          {activeTab === 'upload' && uploadedImage && (
            <button
              className="btn-primary"
              style={{ padding: '0.55rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={handleInsertUploadedImage}
            >
              <Check size={14} /> Insert Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
