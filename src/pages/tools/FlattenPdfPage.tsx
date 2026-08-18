import React, { useState, useRef } from 'react';
import { Layers, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { flattenPdf } from '../../pdf/flattenPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult } from '../../pdf/types';

export default function FlattenPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFlatten = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await flattenPdf(
        file,
        (p, msg) => {
          setProgress(p);
          if (msg) setStatusMessage(msg);
        },
        abortControllerRef.current.signal
      );
      setResult(res);
    } catch (err: any) {
      if (err.message !== 'Operation cancelled.') {
        setError(err.message || 'Failed to flatten PDF document.');
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
        title="Flatten PDF"
        description="Convert all editable form fields, digital signatures, stamps, and annotations into static, non-editable PDF graphics. 100% private in-browser processing."
        icon={<Layers size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Flatten PDF" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={files => files[0] && setFile(files[0])}
          title="Select PDF to Flatten"
          subtitle="Lock in form entries, signatures, and annotations"
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
                  Size: {formatBytes(file.size)}
                </div>
              </div>
            </div>
            <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={handleReset}>
              Change
            </button>
          </div>

          <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <ShieldCheck size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.82rem', color: 'rgba(240,240,240,0.7)', lineHeight: 1.5 }}>
              Flattening bakes interactive fields, signatures, stamps, and annotations directly into the document canvas. After flattening, third-party viewers cannot modify or tamper with form inputs.
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
            onClick={handleFlatten}
          >
            <Layers size={18} />
            <span>Flatten PDF Document</span>
          </button>
        </div>
      )}
    </div>
  );
}
