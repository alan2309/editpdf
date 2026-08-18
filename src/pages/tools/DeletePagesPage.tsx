import React, { useState, useRef, useEffect } from 'react';
import { Trash2, FileText, AlertCircle } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import PageRangeSelector from '../../components/toolbox/PageRangeSelector';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { deletePages } from '../../pdf/deletePages';
import { getPdfPageCount } from '../../pdf/loadPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult } from '../../pdf/types';

export default function DeletePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pagesToDelete, setPagesToDelete] = useState<string>('');
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

  const handleDelete = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await deletePages(
        file,
        pagesToDelete,
        (p, msg) => {
          setProgress(p);
          if (msg) setStatusMessage(msg);
        },
        abortControllerRef.current.signal
      );
      setResult(res);
    } catch (err: any) {
      if (err.message !== 'Operation cancelled.') {
        setError(err.message || 'Failed to delete pages.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setPagesToDelete('');
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.25rem 6rem' }}>
      <ToolHeader
        title="Delete PDF Pages"
        description="Remove unwanted pages or sections from a PDF document while keeping the rest intact. 100% private in-browser processing."
        icon={<Trash2 size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Delete Pages" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={files => files[0] && setFile(files[0])}
          title="Select PDF to Remove Pages"
        />
      ) : (
        <div style={{ width: '100%', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-glass" style={{ padding: '1rem 1.25rem', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
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

          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <PageRangeSelector
              totalPages={totalPages}
              value={pagesToDelete}
              onChange={setPagesToDelete}
              label="Pages to Delete:"
              placeholder="e.g. 2, 5-7, 12"
            />
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
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: '#ef4444', borderColor: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={handleDelete}
            disabled={!pagesToDelete.trim()}
          >
            <Trash2 size={18} />
            <span>Remove Selected Pages</span>
          </button>
        </div>
      )}
    </div>
  );
}
