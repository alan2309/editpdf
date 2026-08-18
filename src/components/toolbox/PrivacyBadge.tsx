import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface PrivacyBadgeProps {
  compact?: boolean;
}

export default function PrivacyBadge({ compact = false }: PrivacyBadgeProps) {
  if (compact) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#4ade80',
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.25)',
          padding: '0.25rem 0.6rem',
          borderRadius: '2rem',
        }}
      >
        <Lock size={12} />
        <span>100% Local In-Browser</span>
      </span>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.85rem',
        background: 'rgba(34,197,94,0.1)',
        border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: '2rem',
        fontSize: '0.8rem',
        color: '#86efac',
        fontWeight: 600,
      }}
    >
      <ShieldCheck size={15} color="#4ade80" />
      <span>Processed 100% locally on your device &mdash; No file upload</span>
    </div>
  );
}
