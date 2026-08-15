import React from 'react';
import Hero from '../components/Hero';
import FAQ from '../components/FAQ';
import { EyeOff, ShieldAlert, CheckCircle2, ArrowRight, ShieldCheck, FileKey, Sparkles } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';
import { SEO_DATA } from '../utils/seo';

interface SpokeProps {
  onFileSelected: (file: File) => void;
}

export default function RedactPdfInBrowserPage({ onFileSelected }: SpokeProps) {
  const seo = SEO_DATA['/redact-pdf-in-browser'];

  return (
    <div>
      {/* Targeted Hero */}
      <Hero
        onFileSelected={onFileSelected}
        badgeText={seo.badge}
        h1Title={seo.h1}
        h1Highlight={seo.h1Highlight}
        h1Subtitle={seo.h1Subtitle}
        description="Permanently remove or blackout Social Security Numbers, credit card details, addresses, and sensitive PII from PDF documents in your browser. No server upload, zero data leaks."
      />

      {/* Spoke Content */}
      <section style={{ padding: '4rem 0 2rem', maxWidth: 1040, margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        
        {/* Critical Distinction: True Redaction vs Fake Black Boxes */}
        <div className="card-glass" style={{ borderRadius: '1.5rem', padding: '2.5rem 2rem', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={22} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>
              The Danger of &ldquo;Fake Redaction&rdquo; in Standard PDF Viewers
            </h3>
          </div>

          <div style={{ color: 'rgba(240,240,240,0.7)', fontSize: '0.92rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              Many high-profile data breaches occur because users draw a black colored rectangle over sensitive text in tools like Apple Preview, Word, or basic web viewers and assume it is redacted. 
              In reality, the underlying text glyphs remain completely intact inside the PDF’s binary stream. Anyone who opens the document can simply highlight, copy, and paste the hidden text, or remove the visual box.
            </p>
            <p>
              <strong>How EditPDF Performs True Vector-Level Sanitization:</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '1.25rem' }}>
                <strong style={{ color: '#4ade80', display: 'block', marginBottom: '0.35rem' }}>Text Stream Erasure</strong>
                <span style={{ fontSize: '0.85rem' }}>When you delete a text node, the original text is stripped from the document’s content stream during export, rendering it completely unrecoverable via copy-paste.</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '1.25rem' }}>
                <strong style={{ color: '#4ade80', display: 'block', marginBottom: '0.35rem' }}>Zero Server Transmission</strong>
                <span style={{ fontSize: '0.85rem' }}>Because you are redacting confidential secrets, uploading the file to a cloud server to redact it defeats the purpose. With EditPDF, nothing ever leaves your device.</span>
              </div>
            </div>
          </div>
        </div>

        {/* How to Redact Steps */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.75rem' }}>
              How to Redact & Blackout Text in <span className="text-gradient">3 Simple Steps</span>
            </h2>
            <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '1rem', maxWidth: 640, margin: '0 auto' }}>
              Clean, instantaneous in-browser document sanitization.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', marginBottom: '0.75rem' }}>01</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Select Sensitive Item</h3>
              <p style={{ fontSize: '0.86rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Click on the SSN, phone number, name, or confidential clause you need to redact.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', marginBottom: '0.75rem' }}>02</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Erase or Blackout</h3>
              <p style={{ fontSize: '0.86rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Click the trash icon to erase the text entirely, or replace it with standard redaction characters like [REDACTED] or █████.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', marginBottom: '0.75rem' }}>03</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Export Sanitized PDF</h3>
              <p style={{ fontSize: '0.86rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Download your clean PDF. The original vector data is permanently masked and purged from the binary.
              </p>
            </div>
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
            <CustomLink href="/chrome-pdf-editor" className="card-glass" style={{ padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Chrome PDF Editor</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.5)' }}>Extension-free, high speed in-browser editing.</div>
            </CustomLink>
          </div>
        </div>

      </section>

      {/* Specialized FAQ for this Spoke */}
      <FAQ
        items={seo.faqs}
        title="PDF Redaction & Sanitization FAQ"
        subtitle="Common questions regarding permanent text redaction and client-side PII removal."
      />
    </div>
  );
}
