import React from 'react';
import PrivacyBadge from './PrivacyBadge';

interface ToolHeaderProps {
  title: string;
  description: string;
  badge?: string;
  icon?: React.ReactNode;
}

export default function ToolHeader({ title, description, badge, icon }: ToolHeaderProps) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <PrivacyBadge />
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        {icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(77,107,250,0.15)',
              border: '1px solid rgba(77,107,250,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4d6bfa',
            }}
          >
            {icon}
          </div>
        )}
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
          {title}
        </h1>
        {badge && (
          <span style={{ fontSize: '0.75rem', background: '#4d6bfa', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 700 }}>
            {badge}
          </span>
        )}
      </div>

      <p style={{ maxWidth: 640, margin: '0 auto', fontSize: '1rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  );
}
