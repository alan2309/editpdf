import { useRef, useState } from 'react';
import { Upload, FileText, Lock, Zap, Shield, Sparkles } from 'lucide-react';

interface HeroProps {
  onFileSelected: (file: File) => void;
  badgeText?: string;
  h1Title?: string;
  h1Highlight?: string;
  h1Subtitle?: string;
  description?: string;
}

export default function Hero({
  onFileSelected,
  badgeText = 'Free · No Signup · No Upload Required',
  h1Title = '100% Private PDF Text Editor',
  h1Highlight = 'Edit in Browser',
  h1Subtitle = '(No Server Upload)',
  description = 'Upload your PDF, click any text to edit it, and download the modified file — all processed entirely in your browser. Your files never leave your device.',
}: HeroProps) {
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
      style={{ position: 'relative', overflow: 'hidden', paddingTop: '4.5rem', paddingBottom: '4.5rem' }}
    >
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '-10rem', left: '50%', transform: 'translateX(-50%)',
        width: '60rem', height: '30rem', borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(77,107,250,0.14) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '5rem', right: '-8rem',
        width: '25rem', height: '25rem', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'float 6s ease-in-out infinite',
      }} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
        {/* Badge */}
        <div className="animate-fade-in-up" style={{ marginBottom: '1.25rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.3)',
            borderRadius: '2rem', padding: '0.4rem 1.1rem', fontSize: '0.82rem', color: '#7c9aff', fontWeight: 600,
          }}>
            <Sparkles size={13} />
            {badgeText}
          </span>
        </div>

        {/* Headline (H1 for SEO) */}
        <h1
          className="animate-fade-in-up stagger-1"
          style={{
            fontSize: 'clamp(2.1rem, 5.5vw, 3.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            margin: '0 0 1.25rem 0',
            opacity: 0,
          }}
        >
          {h1Title}{' '}
          <span className="text-gradient">{h1Highlight}</span>
          <br />
          <span style={{ color: 'rgba(240,240,240,0.75)', fontWeight: 700, fontSize: '0.72em' }}>
            {h1Subtitle}
          </span>
        </h1>

        {/* Sub-heading */}
        <p
          className="animate-fade-in-up stagger-2"
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.15rem)',
            color: 'rgba(240,240,240,0.6)',
            maxWidth: 680,
            margin: '0 auto 2.25rem',
            lineHeight: 1.65,
            opacity: 0,
          }}
        >
          {description}
        </p>

        {/* Trust badges */}
        <div
          className="animate-fade-in-up stagger-2"
          style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.25rem', flexWrap: 'wrap', opacity: 0 }}
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
            background: isDragOver ? 'rgba(77,107,250,0.08)' : 'rgba(255,255,255,0.02)',
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
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem', color: '#f0f0f0' }}>
              Drop your PDF here
            </p>
            <p style={{ margin: '0.375rem 0 0', color: 'rgba(240,240,240,0.45)', fontSize: '0.875rem' }}>
              or <span style={{ color: '#4d6bfa', fontWeight: 600 }}>click to browse</span> — PDF files only
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(240,240,240,0.35)', fontSize: '0.78rem' }}>
            <FileText size={13} />
            <span>100% Client-side Processing · No Server Upload · Max 50MB</span>
          </div>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display: 'none' }} />
      </div>
    </section>
  );
}
