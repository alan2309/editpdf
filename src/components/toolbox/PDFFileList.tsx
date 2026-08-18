import React from 'react';
import { GripVertical, Trash2, ArrowUp, ArrowDown, FileText, Plus } from 'lucide-react';
import { formatBytes } from '../../pdf/downloadUtils';

interface PDFFileListProps {
  files: File[];
  onReorder: (files: File[]) => void;
  onRemove: (index: number) => void;
  onAddMore?: () => void;
}

export default function PDFFileList({ files, onReorder, onRemove, onAddMore }: PDFFileListProps) {
  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= files.length) return;

    const newFiles = [...files];
    const [moved] = newFiles.splice(index, 1);
    newFiles.splice(target, 0, moved);
    onReorder(newFiles);
  };

  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(240,240,240,0.7)' }}>
          Selected Files ({files.length})
        </span>
        {onAddMore && (
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={onAddMore}
          >
            <Plus size={13} /> Add More Files
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {files.map((file, idx) => (
          <div
            key={`${file.name}-${idx}-${file.size}`}
            className="card-glass"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
              <div style={{ color: 'rgba(240,240,240,0.3)', display: 'flex' }}>
                <GripVertical size={16} />
              </div>

              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(77,107,250,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4d6bfa',
                  flexShrink: 0,
                }}
              >
                <FileText size={16} />
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f0f0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.45)' }}>
                  {formatBytes(file.size)}
                </div>
              </div>
            </div>

            {/* Actions: Move Up / Down & Remove */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                className="btn-icon"
                style={{ width: 28, height: 28 }}
                onClick={() => handleMove(idx, -1)}
                disabled={idx === 0}
                title="Move Up"
                aria-label="Move file up"
              >
                <ArrowUp size={13} />
              </button>

              <button
                type="button"
                className="btn-icon"
                style={{ width: 28, height: 28 }}
                onClick={() => handleMove(idx, 1)}
                disabled={idx === files.length - 1}
                title="Move Down"
                aria-label="Move file down"
              >
                <ArrowDown size={13} />
              </button>

              <button
                type="button"
                className="btn-icon"
                style={{ width: 28, height: 28, color: '#ef4444' }}
                onClick={() => onRemove(idx)}
                title="Remove File"
                aria-label="Remove file from list"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
