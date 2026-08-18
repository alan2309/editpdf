import React from 'react';
import { XCircle } from 'lucide-react';

interface ProcessingProgressProps {
  progress: number;
  statusMessage?: string;
  onCancel?: () => void;
}

export default function ProcessingProgress({ progress, statusMessage, onCancel }: ProcessingProgressProps) {
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div
      className="card-glass"
      style={{
        width: '100%',
        maxWidth: 580,
        margin: '0 auto',
        padding: '2rem 1.75rem',
        borderRadius: '1.25rem',
        textAlign: 'center',
        border: '1px solid rgba(77,107,250,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f0f0' }}>
          {statusMessage || 'Processing PDF locally...'}
        </span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4d6bfa' }}>
          {clampedProgress}%
        </span>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: 8,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clampedProgress}%`,
            background: 'linear-gradient(90deg, #4d6bfa 0%, #a855f7 100%)',
            borderRadius: 4,
            transition: 'width 0.25s ease-out',
          }}
        />
      </div>

      <p style={{ margin: '0 0 1.25rem', fontSize: '0.78rem', color: 'rgba(240,240,240,0.45)' }}>
        🔒 Executing in your browser sandbox. No file is being uploaded to any server.
      </p>

      {onCancel && (
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <XCircle size={14} />
          <span>Cancel Operation</span>
        </button>
      )}
    </div>
  );
}
