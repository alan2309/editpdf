import React from 'react';
import Hero from '../components/Hero';
import FAQ from '../components/FAQ';
import { Cpu, Zap, ArrowRight, ShieldCheck, Laptop, Globe } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';
import { SEO_DATA } from '../utils/seo';

interface SpokeProps {
  onFileSelected: (file: File) => void;
}

export default function ChromePdfEditorPage({ onFileSelected }: SpokeProps) {
  const seo = SEO_DATA['/chrome-pdf-editor'];

  return (
    <div>
      {/* Targeted Hero */}
      <Hero
        onFileSelected={onFileSelected}
        badgeText={seo.badge}
        h1Title={seo.h1}
        h1Highlight={seo.h1Highlight}
        h1Subtitle={seo.h1Subtitle}
        description="High-performance PDF text editing engineered specifically for Google Chrome, Chromium, Microsoft Edge, and Brave. Zero extensions, zero plugins, and zero cloud uploads."
      />

      {/* Spoke Content */}
      <section style={{ padding: '4rem 0 2rem', maxWidth: 1040, margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        
        {/* Chrome & Browser Architecture Benefits */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.75rem' }}>
              Why Edit PDFs in Chrome Without <span className="text-gradient">Extensions</span>
            </h2>
            <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '1rem', maxWidth: 640, margin: '0 auto' }}>
              Browser extensions often request invasive &ldquo;Read and change all your data on all websites&rdquo; permissions. EditPDF requires zero installs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Zap size={22} color="#8b5cf6" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Chromium V8 Speed</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.65, margin: 0 }}>
                Harnesses JIT compilation and native WebAssembly to parse large, multi-page PDFs in milliseconds directly on your hardware.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(77,107,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Laptop size={22} color="#4d6bfa" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Chromebook & OS Agnostic</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.65, margin: 0 }}>
                Runs flawlessly on ChromeOS, macOS, Windows 11, and Linux without downloading bulky software or Adobe installers.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Globe size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Zero Extension Risks</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.65, margin: 0 }}>
                Avoid third-party Chrome Web Store extensions that inject ads, harvest search history, or track personal files.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Deep Dive */}
        <div className="card-glass" style={{ borderRadius: '1.5rem', padding: '2.5rem 2rem', marginBottom: '3.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#f0f0f0' }}>
            Browser Compatibility & Engine Support
          </h3>
          <div style={{ color: 'rgba(240,240,240,0.7)', fontSize: '0.92rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              EditPDF is optimized for all modern web standards. It utilizes the standardized <strong>HTML5 Canvas API</strong>, <strong>TypedArrays (Uint8Array, ArrayBuffer)</strong>, and <strong>Web Workers</strong>. 
              This architecture ensures full hardware acceleration on Chrome, Microsoft Edge, Brave, Mozilla Firefox, Opera, and Apple Safari.
            </p>
            <p>
              Whether you are editing a school assignment on a school-issued Chromebook or updating an executive slide deck on an enterprise workstation, you get consistent, instant, client-side PDF editing without administrative privileges or software install rights.
            </p>
          </div>
        </div>

        {/* Cross-linking */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '3rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#f0f0f0' }}>Related PDF Privacy Tools</h4>
              <p style={{ color: 'rgba(240,240,240,0.5)', fontSize: '0.85rem', margin: 0 }}>Explore specialized zero-upload document utilities</p>
            </div>
            <CustomLink href="/" style={{ color: '#4d6bfa', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
              Back to Main Hub <ArrowRight size={14} />
            </CustomLink>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <CustomLink href="/secure-pdf-editor" className="card-glass" style={{ padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Secure PDF Editor</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.5)' }}>Confidential document editing for legal & medical files.</div>
            </CustomLink>
            <CustomLink href="/edit-bank-statement-pdf" className="card-glass" style={{ padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Edit Bank Statement PDF</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.5)' }}>Safely modify financial statements without cloud logs.</div>
            </CustomLink>
            <CustomLink href="/redact-pdf-in-browser" className="card-glass" style={{ padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Redact PDF in Browser</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.5)' }}>Blackout and erase confidential text locally.</div>
            </CustomLink>
          </div>
        </div>

      </section>

      {/* Specialized FAQ for this Spoke */}
      <FAQ
        items={seo.faqs}
        title="Chrome PDF Editor FAQ"
        subtitle="Common questions about editing PDFs inside Google Chrome without extensions."
      />
    </div>
  );
}
