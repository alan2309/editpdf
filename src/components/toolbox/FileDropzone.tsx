import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { validatePdfFile, validateImageFile } from '../../pdf/validation';

interface FileDropzoneProps {
  acceptType?: 'pdf' | 'image' | 'both';
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
}

export default function FileDropzone({
  acceptType = 'pdf',
  multiple = false,
  onFilesSelected,
  title,
  subtitle,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptMime = acceptType === 'image'
    ? 'image/jpeg,image/png,image/webp'
    : acceptType === 'both'
    ? 'application/pdf,image/jpeg,image/png,image/webp'
    : 'application/pdf';

  const defaultTitle = acceptType === 'image'
    ? multiple ? 'Drop your images here' : 'Drop your image here'
    : multiple ? 'Drop PDF files here' : 'Drop your PDF here';

  const defaultSubtitle = acceptType === 'image'
    ? 'Supports JPG, PNG, WebP up to 50 MB'
    : 'Supports PDF documents up to 100 MB';

  const handleFiles = async (fileList: FileList | File[]) => {
    setError(null);
    const files = Array.from(fileList);

    if (files.length === 0) return;

    const validated: File[] = [];

    for (const file of files) {
      if (acceptType === 'pdf') {
        const res = await validatePdfFile(file);
        if (!res.isValid) {
          setError(res.error || 'Invalid PDF file.');
          return;
        }
      } else if (acceptType === 'image') {
        const res = await validateImageFile(file);
        if (!res.isValid) {
          setError(res.error || 'Invalid image file.');
          return;
        }
      }
      validated.push(file);
    }

    if (validated.length > 0) {
      onFilesSelected(multiple ? validated : [validated[0]]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={e => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          background: isDragOver ? 'rgba(77,107,250,0.12)' : 'rgba(255,255,255,0.03)',
          borderColor: isDragOver ? '#4d6bfa' : 'rgba(255,255,255,0.15)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptMime}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files) {
              handleFiles(e.target.files);
              e.target.value = ''; // Reset for consecutive selections
            }
          }}
        />

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '1rem',
            background: 'rgba(77,107,250,0.15)',
            border: '1px solid rgba(77,107,250,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#4d6bfa',
          }}
        >
          {acceptType === 'image' ? <ImageIcon size={28} /> : acceptType === 'pdf' ? <FileText size={28} /> : <Upload size={28} />}
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#ffffff' }}>
          {title || defaultTitle}
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.5)', margin: '0 0 1.25rem' }}>
          {subtitle || defaultSubtitle}
        </p>

        <button
          type="button"
          className="btn-primary"
          style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}
          onClick={e => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Browse Local Files
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#fca5a5',
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
