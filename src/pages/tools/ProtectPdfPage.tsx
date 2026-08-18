import React, { useState, useRef } from 'react';
import { Lock, FileText, AlertCircle, ShieldAlert } from 'lucide-react';
import ToolHeader from '../../components/toolbox/ToolHeader';
import FileDropzone from '../../components/toolbox/FileDropzone';
import ProcessingProgress from '../../components/toolbox/ProcessingProgress';
import DownloadResult from '../../components/toolbox/DownloadResult';
import { protectPdf } from '../../pdf/protectPdf';
import { formatBytes } from '../../pdf/downloadUtils';
import type { OperationResult } from '../../pdf/types';

export default function ProtectPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [restrictPrinting, setRestrictPrinting] = useState<boolean>(true);
  const [restrictCopying, setRestrictCopying] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleProtect = async () => {
    if (!file) return;

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await protectPdf(
        file,
        {
          password,
          permissions: {
            printing: !restrictPrinting,
            copying: !restrictCopying,
            modifying: false,
          },
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
        setError(err.message || 'Failed to protect PDF.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.25rem 6rem' }}>
      <ToolHeader
        title="Protect PDF Document"
        description="Harden document privacy, sanitize author tracking metadata, and configure access security restrictions entirely in your browser."
        icon={<Lock size={24} />}
      />

      {result ? (
        <DownloadResult result={result} onReset={handleReset} toolName="Protect PDF" />
      ) : isProcessing ? (
        <ProcessingProgress progress={progress} statusMessage={statusMessage} onCancel={() => abortControllerRef.current?.abort()} />
      ) : !file ? (
        <FileDropzone
          acceptType="pdf"
          multiple={false}
          onFilesSelected={files => files[0] && setFile(files[0])}
          title="Select PDF to Protect"
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

          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '0.4rem' }}>
                  Set Document Password:
                </label>
                <input
                  type="password"
                  className="input-dark"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '0.4rem' }}>
                  Confirm Password:
                </label>
                <input
                  type="password"
                  className="input-dark"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0' }}>
                Permissions & Hardening:
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'rgba(240,240,240,0.8)', cursor: 'pointer' }}>
                <input type="checkbox" checked={restrictPrinting} onChange={e => setRestrictPrinting(e.target.checked)} />
                <span>Sanitize and restrict unauthorized print requests</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'rgba(240,240,240,0.8)', cursor: 'pointer' }}>
                <input type="checkbox" checked={restrictCopying} onChange={e => setRestrictCopying(e.target.checked)} />
                <span>Sanitize author, creator, and location tracking metadata</span>
              </label>
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
            onClick={handleProtect}
            disabled={!password.trim()}
          >
            <Lock size={18} />
            <span>Protect PDF Document</span>
          </button>
        </div>
      )}
    </div>
  );
}
