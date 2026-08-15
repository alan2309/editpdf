import React from 'react';
import Hero from '../components/Hero';
import FAQ from '../components/FAQ';
import { FileSpreadsheet, Lock, AlertOctagon, CheckCircle2, ArrowRight, ShieldCheck, CreditCard, Banknote } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';
import { SEO_DATA } from '../utils/seo';

interface SpokeProps {
  onFileSelected: (file: File) => void;
}

export default function BankStatementPdfEditorPage({ onFileSelected }: SpokeProps) {
  const seo = SEO_DATA['/edit-bank-statement-pdf'];

  return (
    <div>
      {/* Targeted Hero */}
      <Hero
        onFileSelected={onFileSelected}
        badgeText={seo.badge}
        h1Title={seo.h1}
        h1Highlight={seo.h1Highlight}
        h1Subtitle={seo.h1Subtitle}
        description="Safely correct typos, adjust transaction notes, and update figures on bank statements and financial PDFs. All editing happens 100% locally in your browser memory — never on cloud servers."
      />

      {/* Spoke Content */}
      <section style={{ padding: '4rem 0 2rem', maxWidth: 1040, margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        
        {/* Warning Banner: Why Never Upload Financial Records */}
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '1.25rem',
          padding: '1.75rem',
          marginBottom: '3.5rem',
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'flex-start',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertOctagon size={24} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fca5a5' }}>
              Why You Should Never Upload Bank Statements to Online Converters
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(240,240,240,0.7)', lineHeight: 1.65, margin: 0 }}>
              Bank statements contain your most critical personal financial identifiers: full legal name, home address, account and routing numbers, payroll sources, and transaction balances. 
              Free cloud PDF tools often store files in remote server logs where data breaches, automated OCR indexing, and unauthorized scraping can lead to severe identity theft. 
              <strong> EditPDF eliminates this risk by processing everything inside your browser tab without any network transmission.</strong>
            </p>
          </div>
        </div>

        {/* Feature & Workflow Grid */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.75rem' }}>
              How to Edit <span className="text-gradient">Financial Statements</span> Privately
            </h2>
            <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '1rem', maxWidth: 640, margin: '0 auto' }}>
              A fast, secure 4-step workflow that preserves table alignment and typography.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4d6bfa', marginBottom: '0.75rem' }}>01</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Open Statement Locally</h3>
              <p style={{ fontSize: '0.86rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Drop your PDF statement into the editor above. The document is parsed instantly in your computer’s RAM.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#8b5cf6', marginBottom: '0.75rem' }}>02</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Click Any Number or Text</h3>
              <p style={{ fontSize: '0.86rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Hover and click on account balances, transaction names, or dates. An inline editing box activates at the exact coordinate.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', marginBottom: '0.75rem' }}>03</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Adjust Font & Alignment</h3>
              <p style={{ fontSize: '0.86rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Match standard font families (Helvetica, Times, Courier), font size, and color to maintain pristine document appearance.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', marginBottom: '0.75rem' }}>04</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Export & Download</h3>
              <p style={{ fontSize: '0.86rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Click Download PDF to compile the updated binary file locally. Close the browser tab and all cache is instantly purged.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases for Financial PDFs */}
        <div className="card-glass" style={{ borderRadius: '1.5rem', padding: '2.5rem 2rem', marginBottom: '3.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#f0f0f0' }}>
            Common Legitimate Use Cases for Statement Editing
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <strong style={{ color: '#f0f0f0', fontSize: '0.92rem', display: 'block' }}>Correcting Vendor Invoices</strong>
                <span style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.55)' }}>Updating billing addresses or PO numbers before bookkeeping entry.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <strong style={{ color: '#f0f0f0', fontSize: '0.92rem', display: 'block' }}>Redacting Financial Account Numbers</strong>
                <span style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.55)' }}>Masking routing numbers and account digits prior to sending proofs to loan officers.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <strong style={{ color: '#f0f0f0', fontSize: '0.92rem', display: 'block' }}>Tax Document Clarification</strong>
                <span style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.55)' }}>Annotating 1099 or W-2 schedules for internal accounting audits.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <strong style={{ color: '#f0f0f0', fontSize: '0.92rem', display: 'block' }}>Mockup & Financial Presentations</strong>
                <span style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.55)' }}>Creating anonymized client case study reports and investor pitch samples.</span>
              </div>
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
            <CustomLink href="/redact-pdf-in-browser" className="card-glass" style={{ padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Redact PDF in Browser</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.5)' }}>Blackout and erase confidential text locally.</div>
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
        title="Bank Statement PDF Editing FAQ"
        subtitle="Common questions regarding financial document security and client-side processing."
      />
    </div>
  );
}
