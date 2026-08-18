import React, { useState, useRef, useEffect } from 'react';
import { Stamp, FileText, AlertCircle } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import PageRangeSelector from '../../components/toolbox/PageRangeSelector';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { addWatermarkToPdf } from '../../pdf/watermarkPdf';
import { getPdfPageCount } from '../../pdf/loadPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult, WatermarkOptions } from '../../pdf/types';

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(36);
  const [opacity, setOpacity] = useState<number>(0.35);
  const [rotation, setRotation] = useState<number>(45);
  const [position, setPosition] = useState<WatermarkOptions['position']>('center');
  const [color, setColor] = useState<string>('#dc2626');
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

  const handleWatermark = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await addWatermarkToPdf(
        file,
        {
          text,
          fontSize,
          opacity,
          rotation,
          position,
          color,
          pagesMode,
          customRanges,
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
        setError(err.message || 'Failed to add watermark to PDF.');
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
        title="Watermark PDF"
        description="Add customized text watermarks across PDF pages with precise control over position, opacity, font size, and rotation angle."
        icon={<Stamp size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Watermark PDF" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={files => files[0] && setFile(files[0])}
          title="Select PDF to Add Watermark"
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
                  {formatBytes(file.size)} • {totalPages} page(s)
                </div>
              </div>
            </div>
            <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={handleReset}>
              Change
            </button>
          </div>

          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '0.4rem' }}>
                Watermark Text:
              </label>
              <input
                type="text"
                className="input-dark"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.35rem' }}>
                  Position:
                </label>
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value as any)}
                  className="input-dark"
                  style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.85rem' }}
                >
                  <option value="center">Center</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.35rem' }}>
                  Font Size ({fontSize}pt):
                </label>
                <input
                  type="range"
                  min={14}
                  max={72}
                  value={fontSize}
                  onChange={e => setFontSize(parseInt(e.target.value, 10))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.35rem' }}>
                  Opacity ({Math.round(opacity * 100)}%):
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(opacity * 100)}
                  onChange={e => setOpacity(parseInt(e.target.value, 10) / 100)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.35rem' }}>
                  Rotation ({rotation}°):
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={15}
                  value={rotation}
                  onChange={e => setRotation(parseInt(e.target.value, 10))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#f0f0f0' }}>
                <input type="radio" checked={pagesMode === 'all'} onChange={() => setPagesMode('all')} />
                <span>All Pages</span>
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
                label="Pages for Watermark:"
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
            onClick={handleWatermark}
            disabled={!text.trim()}
          >
            <Stamp size={18} />
            <span>Apply Watermark</span>
          </button>
        </div>
      )}
    </div>
  );
}
