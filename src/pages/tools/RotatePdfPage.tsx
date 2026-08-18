import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, FileText, AlertCircle } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import PageRangeSelector from '../../components/toolbox/PageRangeSelector';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { rotatePages } from '../../pdf/rotatePages';
import { getPdfPageCount } from '../../pdf/loadPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult, RotateOptions } from '../../pdf/types';

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rotation, setRotation] = useState<RotateOptions['rotation']>(90);
  const [pagesMode, setPagesMode] = useState<'all' | 'custom'>('all');
  const [customRanges, setCustomRanges] = useState<string>('1');
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
      }).catch(() => {
        setError('Failed to inspect PDF pages.');
      });
    }
  }, [file]);

  const handleRotate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await rotatePages(
        file,
        { rotation, pagesMode, customRanges },
        (p, msg) => {
          setProgress(p);
          if (msg) setStatusMessage(msg);
        },
        abortControllerRef.current.signal
      );
      setResult(res);
    } catch (err: any) {
      if (err.message !== 'Operation cancelled.') {
        setError(err.message || 'Failed to rotate PDF.');
      }
    } finally {
      setIsProcessing(false);
    }
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
        title="Rotate PDF Pages"
        description="Permanently rotate PDF pages by 90°, 180°, or 270° clockwise. 100% private in-browser document processing."
        icon={<RotateCw size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Rotate PDF" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={files => files[0] && setFile(files[0])}
          title="Select PDF to Rotate"
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
                  {formatBytes(file.size)} • {totalPages} total page(s)
                </div>
              </div>
            </div>
            <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={handleReset}>
              Change
            </button>
          </div>

          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '0.65rem' }}>
                Rotation Angle:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { angle: 90 as const, label: '90° Clockwise' },
                  { angle: 180 as const, label: '180° Flip' },
                  { angle: 270 as const, label: '90° Counter-CW' },
                ].map(opt => (
                  <button
                    key={opt.angle}
                    type="button"
                    className="btn-secondary"
                    style={{
                      padding: '0.65rem',
                      fontSize: '0.82rem',
                      background: rotation === opt.angle ? 'rgba(77,107,250,0.25)' : undefined,
                      borderColor: rotation === opt.angle ? '#4d6bfa' : undefined,
                      color: rotation === opt.angle ? '#7c9aff' : '#f0f0f0',
                      fontWeight: rotation === opt.angle ? 700 : 500,
                    }}
                    onClick={() => setRotation(opt.angle)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#f0f0f0' }}>
                <input type="radio" checked={pagesMode === 'all'} onChange={() => setPagesMode('all')} />
                <span>Rotate All Pages</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#f0f0f0' }}>
                <input type="radio" checked={pagesMode === 'custom'} onChange={() => setPagesMode('custom')} />
                <span>Selected Pages Only</span>
              </label>
            </div>

            {pagesMode === 'custom' && (
              <PageRangeSelector
                totalPages={totalPages}
                value={customRanges}
                onChange={setCustomRanges}
                label="Pages to Rotate:"
              />
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
            onClick={handleRotate}
          >
            <RotateCw size={18} />
            <span>Apply {rotation}° Rotation</span>
          </button>
        </div>
      )}
    </div>
  );
}
