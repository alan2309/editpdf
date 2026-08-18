import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, EyeOff, Lock, X } from 'lucide-react';
import type { VerificationReport, ExportMode } from '../types/pdf';

interface SecurityStatusBadgeProps {
  redactionsCount: number;
  exportMode: ExportMode;
  verificationReport: VerificationReport | null;
  hasBlackoutRedactions: boolean;
}

export default function SecurityStatusBadge({
  redactionsCount,
  exportMode,
  verificationReport,
  hasBlackoutRedactions,
}: SecurityStatusBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '0.65rem',
          background: hasBlackoutRedactions
            ? (exportMode === 'sanitized' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)')
            : 'rgba(77,107,250,0.12)',
          border: `1px solid ${
            hasBlackoutRedactions
              ? (exportMode === 'sanitized' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)')
              : 'rgba(77,107,250,0.3)'
          }`,
          color: hasBlackoutRedactions
            ? (exportMode === 'sanitized' ? '#86efac' : '#fca5a5')
            : '#93c5fd',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="View document privacy & forensic sanitization status"
      >
        <ShieldCheck size={14} color={hasBlackoutRedactions ? (exportMode === 'sanitized' ? '#22c55e' : '#ef4444') : '#4d6bfa'} />
        <span>Privacy Status</span>
        {redactionsCount > 0 && (
          <span style={{
            background: hasBlackoutRedactions ? (exportMode === 'sanitized' ? '#16a34a' : '#dc2626') : '#3b82f6',
            color: '#fff',
            fontSize: '0.65rem',
            padding: '0.05rem 0.35rem',
            borderRadius: 999,
          }}>
            {redactionsCount}
          </span>
        )}
      </button>

      {/* Security Summary Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 15000,
          padding: '1.5rem',
        }}>
          <div className="card-glass" style={{
            maxWidth: 520,
            width: '100%',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(77,107,250,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShieldCheck size={20} color="#4d6bfa" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>Document Privacy & Security</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>Defensible client-side processing architecture</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#f0f0f0' }}>
                  <strong>100% Local Processing:</strong> Document parsed and rendered directly in your web browser.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#f0f0f0' }}>
                  <strong>Zero Server Transmission:</strong> No PDF bytes or metadata leave your local device.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <EyeOff size={16} color={redactionsCount > 0 ? '#ef4444' : 'rgba(240,240,240,0.5)'} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#f0f0f0' }}>
                  <strong>Redactions:</strong> {redactionsCount} active redaction zone{redactionsCount === 1 ? '' : 's'}.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <Lock size={16} color="#4d6bfa" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#f0f0f0' }}>
                  <strong>Export Mode:</strong> {exportMode === 'sanitized' ? 'Permanent Sanitization (Flattened Stream)' : 'Standard Vector Overlay'}
                </div>
              </div>

              {verificationReport && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem',
                  background: verificationReport.passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  borderRadius: 8,
                  border: `1px solid ${verificationReport.passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  {verificationReport.passed ? (
                    <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                  ) : (
                    <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                  )}
                  <div style={{ fontSize: '0.82rem', color: verificationReport.passed ? '#86efac' : '#fca5a5' }}>
                    <strong>Verification Scan:</strong> {verificationReport.auditNote || (verificationReport.passed ? 'Passed' : 'Warning detected')}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.84rem' }} onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
