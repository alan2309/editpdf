import React from 'react';
import { Combine, Scissors, FileOutput, Trash2, ArrowUpDown, RotateCw, Minimize2, Image as ImageIcon, FileUp, Stamp, Hash, Layers, Lock, ShieldCheck, ArrowRight, Shield } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';

export default function ToolCatalog() {
  const tools = [
    {
      category: 'Organize & Pages',
      items: [
        {
          name: 'Merge PDF',
          href: '/merge-pdf',
          desc: 'Combine multiple PDF files into one ordered document.',
          icon: <Combine size={20} />,
          color: '#4d6bfa',
        },
        {
          name: 'Split PDF',
          href: '/split-pdf',
          desc: 'Extract separate files by custom ranges or single pages.',
          icon: <Scissors size={20} />,
          color: '#8b5cf6',
        },
        {
          name: 'Extract Pages',
          href: '/extract-pdf-pages',
          desc: 'Save specific pages into a new standalone PDF.',
          icon: <FileOutput size={20} />,
          color: '#06b6d4',
        },
        {
          name: 'Delete Pages',
          href: '/delete-pdf-pages',
          desc: 'Remove unwanted pages or sections while keeping the rest.',
          icon: <Trash2 size={20} />,
          color: '#ef4444',
        },
        {
          name: 'Reorder Pages',
          href: '/reorder-pdf-pages',
          desc: 'Rearrange and sort page sequences easily.',
          icon: <ArrowUpDown size={20} />,
          color: '#f59e0b',
        },
        {
          name: 'Rotate PDF',
          href: '/rotate-pdf',
          desc: 'Permanently rotate PDF pages by 90° or 180° clockwise.',
          icon: <RotateCw size={20} />,
          color: '#10b981',
        },
      ],
    },
    {
      category: 'Convert & Optimize',
      items: [
        {
          name: 'Compress PDF',
          href: '/compress-pdf',
          desc: 'Reduce file size with high visual quality and crisp text.',
          icon: <Minimize2 size={20} />,
          color: '#ec4899',
        },
        {
          name: 'PDF to JPG',
          href: '/pdf-to-jpg',
          desc: 'Convert PDF pages into high-resolution JPG images.',
          icon: <ImageIcon size={20} />,
          color: '#6366f1',
        },
        {
          name: 'PDF to PNG',
          href: '/pdf-to-png',
          desc: 'Lossless PNG image extraction for crisp graphs & text.',
          icon: <ImageIcon size={20} />,
          color: '#3b82f6',
        },
        {
          name: 'JPG to PDF',
          href: '/jpg-to-pdf',
          desc: 'Turn photos and screenshots into formatted PDFs.',
          icon: <FileUp size={20} />,
          color: '#14b8a6',
        },
        {
          name: 'PNG to PDF',
          href: '/png-to-pdf',
          desc: 'Convert PNG images to PDF with transparency preservation.',
          icon: <FileUp size={20} />,
          color: '#84cc16',
        },
      ],
    },
    {
      category: 'Enhance & Security',
      items: [
        {
          name: 'Watermark PDF',
          href: '/watermark-pdf',
          desc: 'Add text watermarks with custom opacity and rotation.',
          icon: <Stamp size={20} />,
          color: '#f43f5e',
        },
        {
          name: 'Page Numbers',
          href: '/pdf-page-numbers',
          desc: 'Add headers and footers with custom numbering formats.',
          icon: <Hash size={20} />,
          color: '#a855f7',
        },
        {
          name: 'Flatten PDF',
          href: '/flatten-pdf',
          desc: 'Lock interactive form fields and signatures into graphics.',
          icon: <Layers size={20} />,
          color: '#0ea5e9',
        },
        {
          name: 'Protect PDF',
          href: '/protect-pdf',
          desc: 'Sanitize tracking metadata and configure security limits.',
          icon: <Lock size={20} />,
          color: '#eab308',
        },
        {
          name: 'Secure PDF Editor',
          href: '/secure-pdf-editor',
          desc: 'Zero-cloud in-browser editor for HIPAA and legal privacy.',
          icon: <ShieldCheck size={20} />,
          color: '#22c55e',
        },
      ],
    },
  ];

  return (
    <section style={{ maxWidth: 1200, margin: '4rem auto 2rem', padding: '0 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)', borderRadius: '2rem', padding: '0.35rem 0.85rem', fontSize: '0.8rem', color: '#7c9aff', fontWeight: 600, marginBottom: '0.75rem' }}>
          <Shield size={14} color="#4ade80" />
          <span>Local-First PDF Toolbox</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 0.75rem' }}>
          All Private PDF Tools
        </h2>
        <p style={{ maxWidth: 620, margin: '0 auto', fontSize: '1rem', color: 'rgba(240,240,240,0.65)' }}>
          Every tool executes 100% locally in your web browser. No document upload, no signups, and zero cloud risks.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {tools.map(section => (
          <div key={section.category}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0f0f0', marginBottom: '1rem', borderLeft: '3px solid #4d6bfa', paddingLeft: '0.75rem' }}>
              {section.category}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {section.items.map(t => (
                <CustomLink
                  key={t.href}
                  href={t.href}
                  className="card-glass"
                  style={{
                    textDecoration: 'none',
                    padding: '1.25rem',
                    borderRadius: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(77,107,250,0.4)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: `${t.color}22`,
                        border: `1px solid ${t.color}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: t.color,
                        flexShrink: 0,
                      }}
                    >
                      {t.icon}
                    </div>
                    <strong style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700 }}>
                      {t.name}
                    </strong>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'rgba(240,240,240,0.6)', margin: 0, lineHeight: 1.4 }}>
                    {t.desc}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#7c9aff', fontWeight: 600, marginTop: 'auto' }}>
                    <span>Use Tool</span>
                    <ArrowRight size={13} />
                  </div>
                </CustomLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
