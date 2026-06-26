import React, { useState, useEffect } from 'react';
import { Bold, Italic, Underline, Minus, Plus, Link, Trash2, Check, X } from 'lucide-react';
import type { PDFTextItem, TextFormat } from '../types/pdf';

interface TextFormatToolbarProps {
  item: PDFTextItem;
  onUpdateFormat: (id: string, partial: Partial<TextFormat>) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}

const PRESET_COLORS = [
  '#000000', // Black
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#d97706', // Orange
];

export default function TextFormatToolbar({ item, onUpdateFormat, onDelete, style }: TextFormatToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [tempLink, setTempLink] = useState(item.format.link || '');

  // Reset tempLink when the active item changes or link changes
  useEffect(() => {
    setTempLink(item.format.link || '');
    setShowLinkInput(false);
  }, [item.id, item.format.link]);

  const isNearTop = item.y < 65;

  const handleToggle = (key: 'bold' | 'italic' | 'underline') => {
    onUpdateFormat(item.id, { [key]: !item.format[key] });
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateFormat(item.id, { fontFamily: e.target.value as any });
  };

  const changeFontSize = (delta: number) => {
    // Limit delta to reasonable values (e.g. between -10 and +30)
    const nextDelta = Math.max(-10, Math.min(30, item.format.fontSizeDelta + delta));
    onUpdateFormat(item.id, { fontSizeDelta: nextDelta });
  };

  const handleColorChange = (color: string) => {
    onUpdateFormat(item.id, { color });
  };

  const handleApplyLink = () => {
    onUpdateFormat(item.id, { link: tempLink.trim() });
    setShowLinkInput(false);
  };

  const handleRemoveLink = () => {
    onUpdateFormat(item.id, { link: '' });
    setTempLink('');
    setShowLinkInput(false);
  };

  // Prevent input focus loss when clicking toolbar elements
  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="card-glass"
      onMouseDown={preventFocusLoss}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        // If the item is near the top of the canvas, render the toolbar below the text
        ...(isNearTop ? { top: 'calc(100% + 8px)' } : { bottom: 'calc(100% + 8px)' }),
        background: '#131324',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '0.75rem',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        whiteSpace: 'nowrap',
        pointerEvents: 'auto',
        ...style,
      }}
    >
      {showLinkInput ? (
        // Link Input Mode
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Link size={13} style={{ color: '#4d6bfa' }} />
          <input
            type="text"
            placeholder="https://example.com"
            value={tempLink}
            onChange={e => setTempLink(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.375rem',
              color: '#fff',
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              outline: 'none',
              width: '150px',
              fontFamily: 'sans-serif',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleApplyLink();
              if (e.key === 'Escape') setShowLinkInput(false);
            }}
            autoFocus
          />
          <button
            onClick={handleApplyLink}
            style={{
              background: '#4d6bfa',
              border: 'none',
              color: '#fff',
              padding: '0.25rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Apply link"
          >
            <Check size={12} />
          </button>
          {item.format.link && (
            <button
              onClick={handleRemoveLink}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: 'none',
                color: '#fca5a5',
                padding: '0.25rem 0.5rem',
                fontSize: '0.7rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
              title="Remove link"
            >
              Remove
            </button>
          )}
          <button
            onClick={() => setShowLinkInput(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              padding: '0.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        // Formatting Mode
        <>
          {/* Font Family */}
          <select
            value={item.format.fontFamily}
            onChange={handleFontChange}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '0.375rem',
              color: '#f0f0f0',
              fontSize: '0.75rem',
              padding: '0.2rem 0.4rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="helvetica" style={{ background: '#ffffff', color: '#000000' }}>Sans (Helvetica)</option>
            <option value="times" style={{ background: '#ffffff', color: '#000000' }}>Serif (Times)</option>
            <option value="courier" style={{ background: '#ffffff', color: '#000000' }}>Mono (Courier)</option>
          </select>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Font Size Delta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
            <button
              onClick={() => changeFontSize(-1)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Decrease size"
            >
              <Minus size={11} />
            </button>
            <span style={{ fontSize: '0.7rem', color: 'rgba(240, 240, 240, 0.75)', minWidth: '32px', textAlign: 'center', fontWeight: 600 }}>
              {Math.round(item.fontSize + item.format.fontSizeDelta)}px
            </span>
            <button
              onClick={() => changeFontSize(1)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Increase size"
            >
              <Plus size={11} />
            </button>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Bold, Italic, Underline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={() => handleToggle('bold')}
              style={{
                background: item.format.bold ? 'rgba(77, 107, 250, 0.25)' : 'transparent',
                border: 'none',
                color: item.format.bold ? '#4d6bfa' : '#c0c0d0',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Bold"
            >
              <Bold size={12} style={{ strokeWidth: 3 }} />
            </button>
            <button
              onClick={() => handleToggle('italic')}
              style={{
                background: item.format.italic ? 'rgba(77, 107, 250, 0.25)' : 'transparent',
                border: 'none',
                color: item.format.italic ? '#4d6bfa' : '#c0c0d0',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Italic"
            >
              <Italic size={12} style={{ strokeWidth: 3 }} />
            </button>
            <button
              onClick={() => handleToggle('underline')}
              style={{
                background: item.format.underline ? 'rgba(77, 107, 250, 0.25)' : 'transparent',
                border: 'none',
                color: item.format.underline ? '#4d6bfa' : '#c0c0d0',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Underline"
            >
              <Underline size={12} style={{ strokeWidth: 3 }} />
            </button>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Preset Colors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => handleColorChange(c)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: c,
                  border: item.format.color === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  boxSizing: 'border-box',
                }}
                title={c}
              />
            ))}

            {/* Custom Color Picker Dot */}
            <label
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'linear-gradient(to right, red, orange, yellow, green, blue, purple)',
                border: !PRESET_COLORS.includes(item.format.color) ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'inline-block',
                marginLeft: '1px',
                boxSizing: 'border-box',
                position: 'relative',
              }}
              title="Custom Color"
            >
              <input
                type="color"
                value={item.format.color}
                onChange={e => handleColorChange(e.target.value)}
                style={{
                  opacity: 0,
                  width: 0,
                  height: 0,
                  border: 'none',
                  padding: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  cursor: 'pointer',
                }}
              />
            </label>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Link button */}
          <button
            onClick={() => setShowLinkInput(true)}
            style={{
              background: item.format.link ? 'rgba(77, 107, 250, 0.25)' : 'transparent',
              border: 'none',
              color: item.format.link ? '#4d6bfa' : '#c0c0d0',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={item.format.link ? `Has link: ${item.format.link} (Click to edit)` : 'Add link'}
          >
            <Link size={12} />
          </button>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Delete Button */}
          <button
            onClick={() => onDelete(item.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Delete text block"
          >
            <Trash2 size={12} />
          </button>
        </>
      )}
    </div>
  );
}
