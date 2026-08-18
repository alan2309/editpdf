import React, { useState, useRef } from 'react';
import { Combine, AlertCircle } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import PDFFileList from '../../components/toolbox/PDFFileList';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { mergePdfs } from '../../pdf/mergePdf';
import type { OperationResult } from '../../pdf/types';

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await mergePdfs(
        files,
        (p, msg) => {
          setProgress(p);
          if (msg) setStatusMessage(msg);
        },
        abortControllerRef.current.signal
      );
      setResult(res);
    } catch (err: any) {
      if (err.message !== 'Operation cancelled.') {
        setError(err.message || 'Failed to merge PDF files.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
    setStatusMessage('');
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setStatusMessage('');
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.25rem 6rem' }}>
      <ToolHeader
        title="Merge PDF Files"
        description="Combine multiple PDF documents into a single organized PDF. Fast, secure, and processed 100% in your browser without uploading files."
        badge="FREE"
        icon={<Combine size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Merge PDF" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={handleCancel} />
      ) : files.length === 0 ? (
        <FileDropzone
          acceptType="pdf"
          multiple={true}
          onFilesSelected={handleFilesSelected}
          title="Select or Drop PDF Files to Merge"
          subtitle="Add two or more PDF documents. Files are processed locally on your device."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <PDFFileList
            files={files}
            onReorder={setFiles}
            onRemove={idx => setFiles(prev => prev.filter((_, i) => i !== idx))}
            onAddMore={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/pdf';
              input.multiple = true;
              input.onchange = e => {
                const target = e.target as HTMLInputElement;
                if (target.files) handleFilesSelected(Array.from(target.files));
              };
              input.click();
            }}
          />

          {error && (
            <div style={{ width: '100%', maxWidth: 680, padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.75rem 2.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={handleMerge}
              disabled={files.length < 2}
            >
              <Combine size={18} />
              <span>Merge {files.length} PDFs</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.75rem 1.25rem' }}
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
