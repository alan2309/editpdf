import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import PageRangeSelector from '../../components/toolbox/PageRangeSelector';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { convertPdfToImages } from '../../pdf/pdfToImages';
import { getPdfPageCount } from '../../pdf/loadPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult, PdfToImageOptions } from '../../pdf/types';

export default function PdfToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [dpi, setDpi] = useState<PdfToImageOptions['dpi']>(150);
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

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await convertPdfToImages(
        file,
        {
          format: 'png',
          dpi,
          quality: 1.0,
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
        setError(err.message || 'Failed to convert PDF to PNG.');
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
        title="PDF to PNG"
        description="Convert PDF documents into crisp, lossless PNG images. Ideal for illustrations, graphs, screenshots, and sharp text rendering."
        icon={<ImageIcon size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="PDF to PNG" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={files => files[0] && setFile(files[0])}
          title="Select PDF to Convert to PNG"
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '0.65rem' }}>
                PNG Resolution (DPI):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { val: 72 as const, label: '72 DPI (Fast)' },
                  { val: 150 as const, label: '150 DPI (Crisp)' },
                  { val: 300 as const, label: '300 DPI (Ultra HD)' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    className="btn-secondary"
                    style={{
                      padding: '0.65rem',
                      fontSize: '0.82rem',
                      background: dpi === opt.val ? 'rgba(77,107,250,0.25)' : undefined,
                      borderColor: dpi === opt.val ? '#4d6bfa' : undefined,
                      color: dpi === opt.val ? '#7c9aff' : '#f0f0f0',
                      fontWeight: dpi === opt.val ? 700 : 500,
                    }}
                    onClick={() => setDpi(opt.val)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#f0f0f0' }}>
                <input type="radio" checked={pagesMode === 'all'} onChange={() => setPagesMode('all')} />
                <span>Convert All Pages</span>
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
                label="Pages to Convert:"
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
            onClick={handleConvert}
          >
            <ImageIcon size={18} />
            <span>Convert to Lossless PNG</span>
          </button>
        </div>
      )}
    </div>
  );
}
