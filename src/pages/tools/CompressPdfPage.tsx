import React, { useState, useRef } from 'react';
import { Minimize2, FileText, AlertCircle, Sparkles } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { compressPdf } from '../../pdf/compressPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult, CompressOptions } from '../../pdf/types';

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressOptions['mode']>('balanced');
  const [targetDpi, setTargetDpi] = useState<72 | 100 | 150>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await compressPdf(
        file,
        {
          mode,
          targetDpi: mode === 'maximum' ? targetDpi : 150,
          quality: mode === 'maximum' ? 0.6 : 0.78,
        },
        (p, msg) => {
          setProgress(p);
          if (msg) setStatusMessage(msg);
        },
        abortControllerRef.current.signal
      );
      setResult(res);
    } catch (err: any) {
      if (err.message !== 'Operation cancelled.') {
        setError(err.message || 'Failed to compress PDF.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.25rem 6rem' }}>
      <ToolHeader
        title="Compress PDF"
        description="Reduce PDF file size while preserving high visual quality and text clarity. 100% private in-browser compression without server uploads."
        icon={<Minimize2 size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Compress PDF" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={files => files[0] && setFile(files[0])}
          title="Select PDF to Compress"
        />
      ) : (
        <div style={{ width: '100%', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-glass" style={{ padding: '1rem 1.25rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(77,107,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4d6bfa' }}>
                <FileText size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#f0f0f0' }}>{file.name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>
                  Original Size: {formatBytes(file.size)}
                </div>
              </div>
            </div>
            <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={handleReset}>
              Change
            </button>
          </div>

          {/* Compression Level Presets */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0' }}>
              Compression Mode:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
              <div
                onClick={() => setMode('safe')}
                style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: `1.5px solid ${mode === 'safe' ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                  background: mode === 'safe' ? 'rgba(77,107,250,0.15)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#f0f0f0' }}>Safe</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)', lineHeight: 1.4 }}>
                  Preserves original PDF structure and selectable text. May produce little or no size reduction.
                </div>
              </div>

              <div
                onClick={() => setMode('balanced')}
                style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: `1.5px solid ${mode === 'balanced' ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                  background: mode === 'balanced' ? 'rgba(77,107,250,0.15)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <span style={{ position: 'absolute', top: -8, right: 10, background: '#22c55e', color: '#000', fontSize: '0.62rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                  RECOMMENDED
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#f0f0f0' }}>Balanced</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)', lineHeight: 1.4 }}>
                  Reduces image data &amp; cleans object streams while preserving searchable text and vectors.
                </div>
              </div>

              <div
                onClick={() => setMode('maximum')}
                style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: `1.5px solid ${mode === 'maximum' ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                  background: mode === 'maximum' ? 'rgba(77,107,250,0.15)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#f0f0f0' }}>Maximum</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)', lineHeight: 1.4 }}>
                  Strongest reduction. Pages are converted to images and text is no longer selectable.
                </div>
              </div>
            </div>

            {mode === 'maximum' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.4rem' }}>
                    Target Resolution:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {([72, 100, 150] as const).map(dpi => (
                      <button
                        key={dpi}
                        type="button"
                        className={targetDpi === dpi ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={() => setTargetDpi(dpi)}
                      >
                        {dpi} DPI
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.65rem', color: '#fcd34d', fontSize: '0.78rem', lineHeight: 1.4 }}>
                  ⚠️ <strong>Notice:</strong> Maximum compression converts PDF pages into images and removes selectable/searchable text.
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            className="btn-primary"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={handleCompress}
          >
            <Sparkles size={18} />
            <span>Compress PDF File</span>
          </button>
        </div>
      )}
    </div>
  );
}
