import { useRef, useState } from 'react';
import { Upload, FileText, Lock, Zap, Shield } from 'lucide-react';

interface HeroProps {
  onFileSelected: (file: File) => void;
}

export default function Hero({ onFileSelected }: HeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') onFileSelected(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  const badges = [
    { icon: <Lock size={12} />, text: 'No Upload' },
    { icon: <Zap size={12} />, text: 'Instant Edit' },
    { icon: <Shield size={12} />, text: '100% Private' },
  ];

  return (
    <section
      style={{ position: 'relative', overflow: 'hidden', paddingTop: '5rem', paddingBottom: '5rem' }}
    >
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '-10rem', left: '50%', transform: 'translateX(-50%)',
        width: '60rem', height: '30rem', borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(77,107,250,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '5rem', right: '-8rem',
        width: '25rem', height: '25rem', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'float 6s ease-in-out infinite',
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
        {/* Badge */}
        <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.3)',
            borderRadius: '2rem', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#7c9aff', fontWeight: 600,
          }}>
            <Zap size={12} />
            Free · No Signup · No Upload Required
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up stagger-1"
          style={{
            fontSize: 'clamp(2.25rem, 6vw, 3.75rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: '0 0 1.25rem 0',
            opacity: 0,
          }}
        >
          Edit PDF Text{' '}
          <span className="text-gradient">Online</span>
          <br />
          <span style={{ color: 'rgba(240,240,240,0.75)', fontWeight: 700, fontSize: '0.75em' }}>
            Free, Private & Instant
          </span>
        </h1>

        {/* Sub-heading */}
        <p
          className="animate-fade-in-up stagger-2"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'rgba(240,240,240,0.55)',
            maxWidth: 600,
            margin: '0 auto 2.5rem',
            lineHeight: 1.65,
            opacity: 0,
          }}
        >
          Upload your PDF, click any text to edit it, and download the modified file —
          all processed <strong style={{ color: 'rgba(240,240,240,0.8)' }}>entirely in your browser</strong>.
          Your files never leave your device.
        </p>

        {/* Trust badges */}
        <div
          className="animate-fade-in-up stagger-2"
          style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap', opacity: 0 }}
        >
          {badges.map(b => (
            <span key={b.text} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '2rem', padding: '0.35rem 0.9rem', fontSize: '0.78rem',
              color: 'rgba(240,240,240,0.7)', fontWeight: 500,
            }}>
              {b.icon} {b.text}
            </span>
          ))}
        </div>

        {/* Drop Zone */}
        <div
          className={`drop-zone animate-fade-in-up stagger-3`}
          style={{
            padding: '3.5rem 2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            cursor: 'pointer',
            opacity: 0,
            background: isDragOver ? 'rgba(77,107,250,0.07)' : 'rgba(255,255,255,0.02)',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div style={{
            width: 72, height: 72, borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, rgba(77,107,250,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(77,107,250,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Upload size={32} color="#4d6bfa" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f0' }}>
              Drop your PDF here
            </p>
            <p style={{ margin: '0.375rem 0 0', color: 'rgba(240,240,240,0.45)', fontSize: '0.875rem' }}>
              or <span style={{ color: '#4d6bfa', fontWeight: 600 }}>click to browse</span> — PDF files only
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(240,240,240,0.3)', fontSize: '0.75rem' }}>
            <FileText size={13} />
            <span>Supports all text-based PDFs · Max 50MB</span>
          </div>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display: 'none' }} />
      </div>
    </section>
  );
}
