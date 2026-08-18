import React, { useState, useRef } from 'react';
import { FileUp, Image as ImageIcon, AlertCircle } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import PDFFileList from '../../components/toolbox/PDFFileList';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { convertImagesToPdf } from '../../pdf/imagesToPdf';
import type { OperationResult, ImageToPdfOptions } from '../../pdf/types';

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<ImageToPdfOptions['pageSize']>('a4');
  const [orientation, setOrientation] = useState<ImageToPdfOptions['orientation']>('auto');
  const [fit, setFit] = useState<ImageToPdfOptions['fit']>('contain');
  const [margin, setMargin] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await convertImagesToPdf(
        files,
        {
          pageSize,
          orientation,
          fit,
          margin,
          backgroundColor: '#ffffff',
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
        setError(err.message || 'Failed to convert images to PDF.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.25rem 6rem' }}>
      <ToolHeader
        title="JPG to PDF Converter"
        description="Convert JPG and JPEG images into clean, formatted PDF documents with customizable page sizes and margins. 100% private in-browser processing."
        icon={<FileUp size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="JPG to PDF" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : files.length === 0 ? (
        <FileDropzone
          acceptType="image"
          multiple={true}
          onFilesSelected={newFiles => setFiles(prev => [...prev, ...newFiles])}
          title="Select or Drop JPG Images"
          subtitle="Add one or multiple JPG files to combine into a PDF"
        />
      ) : (
        <div style={{ width: '100%', maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <PDFFileList
            files={files}
            onReorder={setFiles}
            onRemove={idx => setFiles(prev => prev.filter((_, i) => i !== idx))}
            onAddMore={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/jpeg,image/jpg';
              input.multiple = true;
              input.onchange = e => {
                const target = e.target as HTMLInputElement;
                if (target.files) setFiles(prev => [...prev, ...Array.from(target.files!)]);
              };
              input.click();
            }}
          />

          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.35rem' }}>
                  Page Size:
                </label>
                <select
                  value={pageSize}
                  onChange={e => setPageSize(e.target.value as any)}
                  className="input-dark"
                  style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.85rem' }}
                >
                  <option value="a4">A4 (Standard)</option>
                  <option value="letter">Letter (US)</option>
                  <option value="original">Original Image Dimensions</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.35rem' }}>
                  Orientation:
                </label>
                <select
                  value={orientation}
                  onChange={e => setOrientation(e.target.value as any)}
                  className="input-dark"
                  style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.85rem' }}
                >
                  <option value="auto">Auto (Match Image)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,240,240,0.7)', marginBottom: '0.35rem' }}>
                  Margins (pt):
                </label>
                <select
                  value={margin}
                  onChange={e => setMargin(parseInt(e.target.value, 10))}
                  className="input-dark"
                  style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.85rem' }}
                >
                  <option value={0}>No Margin (Edge-to-Edge)</option>
                  <option value={20}>Small (20pt)</option>
                  <option value={40}>Wide (40pt)</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.75rem 2.25rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={handleConvert}
            >
              <ImageIcon size={18} />
              <span>Create PDF from {files.length} JPG{files.length > 1 ? 's' : ''}</span>
            </button>
            <button type="button" className="btn-secondary" style={{ padding: '0.75rem 1.25rem' }} onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
