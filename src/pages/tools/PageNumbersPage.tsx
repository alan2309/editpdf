import React, { useState, useRef, useEffect } from 'react';
import { Hash, FileText, AlertCircle } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import PageRangeSelector from '../../components/toolbox/PageRangeSelector';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { addPageNumbersToPdf } from '../../pdf/pageNumbers';
import { getPdfPageCount } from '../../pdf/loadPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult, PageNumberOptions } from '../../pdf/types';

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [format, setFormat] = useState<PageNumberOptions['format']>('page-n-of-total');
  const [position, setPosition] = useState<PageNumberOptions['position']>('bottom-center');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(10);
  const [color, setColor] = useState<string>('#333333');
  const [margin, setMargin] = useState<number>(25);
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

  const handleAddNumbers = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await addPageNumbersToPdf(
        file,
        {
          format,
          position,
          startNumber,
          fontSize,
          color,
          margin,
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
        setError(err.message || 'Failed to add page numbers.');
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
        title="PDF Page Numbers"
        description="Insert numbering and page headers/footers with custom formats (e.g., 'Page 1 of 10') and positions. 100% private in-browser document processing."
        icon={<Hash size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Add Page Numbers" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={files => files[0] && setFile(files[0])}
          title="Select PDF to Add Page Numbers"
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.35rem' }}>
                  Numbering Format:
                </label>
                <select
                  value={format}
                  onChange={e => setFormat(e.target.value as any)}
                  className="input-dark"
                  style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.85rem' }}
                >
                  <option value="page-n-of-total">Page 1 of {totalPages || 'N'}</option>
                  <option value="page-n">Page 1</option>
                  <option value="n-of-total">1 of {totalPages || 'N'}</option>
                  <option value="n">1 (Number only)</option>
                </select>
              </div>

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
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.35rem' }}>
                  Starting Number:
                </label>
                <input
                  type="number"
                  min={1}
                  value={startNumber}
                  onChange={e => setStartNumber(parseInt(e.target.value, 10) || 1)}
                  className="input-dark"
                  style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.85rem' }}
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
                label="Pages for Numbering:"
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
            onClick={handleAddNumbers}
          >
            <Hash size={18} />
            <span>Insert Page Numbers</span>
          </button>
        </div>
      )}
    </div>
  );
}
