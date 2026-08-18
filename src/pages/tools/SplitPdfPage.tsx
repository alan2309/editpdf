import React, { useState, useRef, useEffect } from 'react';
import { Scissors, AlertCircle, FileText } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { splitPdf } from '../../pdf/splitPdf';
import { getPdfPageCount } from '../../pdf/loadPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult, SplitOptions } from '../../pdf/types';

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [mode, setMode] = useState<SplitOptions['mode']>('ranges');
  const [ranges, setRanges] = useState<string>('1-2, 3-4');
  const [everyN, setEveryN] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (file) {
      getPdfPageCount(file).then(count => {
        setTotalPages(count);
        if (count > 2) {
          setRanges(`1-${Math.ceil(count / 2)}, ${Math.ceil(count / 2) + 1}-${count}`);
        } else {
          setRanges('1');
        }
      }).catch(() => {
        setError('Failed to inspect PDF pages.');
      });
    }
  }, [file]);

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles[0]) {
      setFile(selectedFiles[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await splitPdf(
        file,
        { mode, ranges, everyN },
        (p, msg) => {
          setProgress(p);
          if (msg) setStatusMessage(msg);
        },
        abortControllerRef.current.signal
      );
      setResult(res);
    } catch (err: any) {
      if (err.message !== 'Operation cancelled.') {
        setError(err.message || 'Failed to split PDF document.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.25rem 6rem' }}>
      <ToolHeader
        title="Split PDF Document"
        description="Extract separate PDF files by custom page ranges, individual pages, or recurring intervals. Processed securely and locally in your browser."
        icon={<Scissors size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Split PDF" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={handleCancel} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Select or Drop PDF to Split"
          subtitle="Extract single pages or custom range bundles"
        />
      ) : (
        <div style={{ width: '100%', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* File Card */}
          <div className="card-glass" style={{ padding: '1rem 1.25rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(77,107,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4d6bfa' }}>
                <FileText size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#f0f0f0' }}>{file.name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>
                  {formatBytes(file.size)} • {totalPages} total page(s)
                </div>
              </div>
            </div>
            <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={handleReset}>
              Change
            </button>
          </div>

          {/* Mode Configuration */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0' }}>
              Split Mode:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem' }}>
              <label
                onClick={() => setMode('ranges')}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.65rem',
                  border: `1.5px solid ${mode === 'ranges' ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                  background: mode === 'ranges' ? 'rgba(77,107,250,0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <input type="radio" checked={mode === 'ranges'} onChange={() => setMode('ranges')} />
                <span>Custom Ranges</span>
              </label>

              <label
                onClick={() => setMode('every-page')}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.65rem',
                  border: `1.5px solid ${mode === 'every-page' ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                  background: mode === 'every-page' ? 'rgba(77,107,250,0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <input type="radio" checked={mode === 'every-page'} onChange={() => setMode('every-page')} />
                <span>Every Single Page</span>
              </label>

              <label
                onClick={() => setMode('every-n-pages')}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.65rem',
                  border: `1.5px solid ${mode === 'every-n-pages' ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                  background: mode === 'every-n-pages' ? 'rgba(77,107,250,0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <input type="radio" checked={mode === 'every-n-pages'} onChange={() => setMode('every-n-pages')} />
                <span>Every N Pages</span>
              </label>
            </div>

            {mode === 'ranges' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.4rem' }}>
                  Define Page Range Bundles (comma or semicolon separated):
                </label>
                <input
                  type="text"
                  className="input-dark"
                  value={ranges}
                  onChange={e => setRanges(e.target.value)}
                  placeholder="e.g. 1-3, 4-6, 7-10"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'rgba(240,240,240,0.45)', marginTop: '0.35rem' }}>
                  Each group generates a separate PDF bundle.
                </div>
              </div>
            )}

            {mode === 'every-n-pages' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.4rem' }}>
                  Split into chunks of every N pages:
                </label>
                <input
                  type="number"
                  min={1}
                  max={totalPages || 100}
                  value={everyN}
                  onChange={e => setEveryN(parseInt(e.target.value, 10) || 1)}
                  className="input-dark"
                  style={{ width: 140, padding: '0.5rem 0.85rem', fontSize: '0.9rem' }}
                />
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
            onClick={handleSplit}
          >
            <Scissors size={18} />
            <span>Split PDF Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
