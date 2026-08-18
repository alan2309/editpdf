import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, FileText, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { reorderPages } from '../../pdf/reorderPages';
import { getPdfPageCount } from '../../pdf/loadPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult } from '../../pdf/types';

export default function ReorderPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (file) {
      getPdfPageCount(file).then(count => {
        setPageOrder(Array.from({ length: count }, (_, i) => i + 1));
      }).catch(() => {
        setError('Failed to inspect PDF pages.');
      });
    }
  }, [file]);

  const movePage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= pageOrder.length) return;

    const newOrder = [...pageOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(target, 0, moved);
    setPageOrder(newOrder);
  };

  const handleReorder = async () => {
    if (!file || pageOrder.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await reorderPages(
        file,
        pageOrder,
        (p, msg) => {
          setProgress(p);
          if (msg) setStatusMessage(msg);
        },
        abortControllerRef.current.signal
      );
      setResult(res);
    } catch (err: any) {
      if (err.message !== 'Operation cancelled.') {
        setError(err.message || 'Failed to reorder pages.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageOrder([]);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.25rem 6rem' }}>
      <ToolHeader
        title="Reorder PDF Pages"
        description="Organize and rearrange PDF pages into your preferred order with simple move controls. 100% private in-browser processing."
        icon={<ArrowUpDown size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Reorder Pages" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={files => files[0] && setFile(files[0])}
          title="Select PDF to Rearrange Pages"
        />
      ) : (
        <div style={{ width: '100%', maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-glass" style={{ padding: '1rem 1.25rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(77,107,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4d6bfa' }}>
                <FileText size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#f0f0f0' }}>{file.name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>
                  {formatBytes(file.size)} • {pageOrder.length} page(s)
                </div>
              </div>
            </div>
            <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={handleReset}>
              Change
            </button>
          </div>

          {/* Reordering Page Grid */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '1rem' }}>
              Arrange Page Sequence (Left to Right):
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem', maxHeight: 380, overflowY: 'auto', padding: '0.5rem' }}>
              {pageOrder.map((pageNum, idx) => (
                <div
                  key={`${pageNum}-${idx}`}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ width: 42, height: 56, borderRadius: 6, background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#7c9aff', fontSize: '1rem' }}>
                    {pageNum}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>
                    Slot #{idx + 1}
                  </span>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ width: 24, height: 24 }}
                      onClick={() => movePage(idx, -1)}
                      disabled={idx === 0}
                      title="Move Left"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ width: 24, height: 24 }}
                      onClick={() => movePage(idx, 1)}
                      disabled={idx === pageOrder.length - 1}
                      title="Move Right"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
            onClick={handleReorder}
          >
            <ArrowUpDown size={18} />
            <span>Save New Page Order</span>
          </button>
        </div>
      )}
    </div>
  );
}
