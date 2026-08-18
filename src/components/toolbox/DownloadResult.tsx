import React from 'react';
import { Download, CheckCircle2, RotateCcw, ArrowRight, FileArchive, FileText, Sparkles } from 'lucide-react';
import type { OperationResult } from '../../pdf/types';
import { downloadBlob, formatBytes } from '../../pdf/downloadUtils';
import { CustomLink } from '../../context/RouterContext';

interface DownloadResultProps {
  result: OperationResult;
  onReset: () => void;
  toolName: string;
}

export default function DownloadResult({ result, onReset, toolName }: DownloadResultProps) {
  const handleDownload = () => {
    downloadBlob(result.blob, result.fileName);
  };

  const hasSavings = result.originalSize && result.originalSize > result.fileSize;
  const savingsPercent = hasSavings
    ? Math.round(((result.originalSize! - result.fileSize) / result.originalSize!) * 100)
    : 0;

  return (
    <div
      className="card-glass"
      style={{
        width: '100%',
        maxWidth: 620,
        margin: '0 auto',
        padding: '2.5rem 2rem',
        borderRadius: '1.25rem',
        textAlign: 'center',
        border: '1.5px solid rgba(34,197,94,0.35)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22c55e',
          margin: '0 auto 1.25rem',
        }}
      >
        <CheckCircle2 size={30} />
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#ffffff' }}>
        {toolName} Complete!
      </h2>

      <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'rgba(240,240,240,0.6)' }}>
        Your file was processed 100% locally and is ready to download.
      </p>

      {/* File Info Box */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.85rem',
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: result.isZip ? 'rgba(168,85,247,0.15)' : 'rgba(77,107,250,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: result.isZip ? '#a855f7' : '#4d6bfa',
              flexShrink: 0,
            }}
          >
            {result.isZip ? <FileArchive size={20} /> : <FileText size={20} />}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f0f0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {result.fileName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(240,240,240,0.5)', marginTop: 2 }}>
              Size: {formatBytes(result.fileSize)}
              {result.pageCount !== undefined && ` • ${result.pageCount} page(s)`}
            </div>
          </div>
        </div>

        {hasSavings ? (
          <div
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '0.5rem',
              padding: '0.35rem 0.65rem',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 700 }}>Saved</div>
            <div style={{ fontSize: '0.95rem', color: '#4ade80', fontWeight: 800 }}>-{savingsPercent}%</div>
          </div>
        ) : toolName === 'Compress PDF' && result.isOriginalRetained ? (
          <div
            style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '0.5rem',
              padding: '0.35rem 0.65rem',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#fcd34d', textTransform: 'uppercase', fontWeight: 700 }}>Original</div>
            <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 800 }}>Retained</div>
          </div>
        ) : null}
      </div>

      {toolName === 'Compress PDF' && result.isOriginalRetained && (
        <div style={{ margin: '-1rem 0 1.5rem', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.65rem', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: 'rgba(240,240,240,0.6)' }}>
          ℹ️ <strong>Document Quality Protected:</strong> No smaller PDF could be produced without altering visual clarity or vector fidelity. The original file has been preserved.
        </div>
      )}

      {/* Main Download Action */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={handleDownload}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 8px 25px rgba(77,107,250,0.4)',
          }}
        >
          <Download size={18} />
          <span>Download {result.isZip ? 'ZIP Archive' : 'PDF'}</span>
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={onReset}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RotateCcw size={15} />
          <span>Start Over</span>
        </button>
      </div>

      {/* Continue with other tools */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(240,240,240,0.6)', marginBottom: '0.85rem' }}>
          <Sparkles size={14} color="#4d6bfa" />
          <span>Continue Editing with Other Private Tools:</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
          <CustomLink
            href="/"
            className="btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
          >
            <span>Edit Text & Sign</span>
            <ArrowRight size={12} />
          </CustomLink>
          <CustomLink
            href="/compress-pdf"
            className="btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
          >
            <span>Compress PDF</span>
            <ArrowRight size={12} />
          </CustomLink>
          <CustomLink
            href="/merge-pdf"
            className="btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
          >
            <span>Merge PDFs</span>
            <ArrowRight size={12} />
          </CustomLink>
          <CustomLink
            href="/watermark-pdf"
            className="btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
          >
            <span>Watermark PDF</span>
            <ArrowRight size={12} />
          </CustomLink>
        </div>
      </div>
    </div>
  );
}
