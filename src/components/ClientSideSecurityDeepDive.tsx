import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle, AlertTriangle, Cpu, Globe, Server, Check } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';

export default function ClientSideSecurityDeepDive() {
  return (
    <section 
      id="security-deep-dive" 
      style={{ 
        padding: '5rem 0 6rem', 
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(10,10,15,0) 0%, rgba(15,15,25,0.6) 100%)'
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '2rem', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#34d399', fontWeight: 600,
            marginBottom: '1rem',
          }}>
            <ShieldCheck size={14} />
            100% In-Browser Privacy Architecture
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 1rem', color: '#f0f0f0' }}>
            Why <span className="text-gradient">Zero-Upload Client-Side</span> PDF Editing Matters
          </h2>
          <p style={{ color: 'rgba(240,240,240,0.65)', fontSize: '1.05rem', maxWidth: 740, margin: '0 auto', lineHeight: 1.7 }}>
            The definitive guide to understanding why browser-based PDF editing is the safest, fastest, and most secure method to edit PDF text, bank statements, and confidential documents online.
          </p>
        </div>

        {/* Pillar 1: The Hidden Risks of Server-Side PDF Converters */}
        <article className="card-glass" style={{ borderRadius: '1.25rem', padding: '2.5rem 2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>
              The Privacy Pitfalls of Conventional Cloud PDF Editors
            </h3>
          </div>

          <div style={{ color: 'rgba(240,240,240,0.72)', fontSize: '0.96rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              When you use traditional online PDF editors, you are forced to upload your file to an unknown third-party server. Even if a service advertises &ldquo;we delete your files after 1 hour,&rdquo; your confidential documents are still transmitted across the open internet, decrypted on remote cloud machines, and stored in server storage or cache drives.
            </p>
            <p>
              This legacy cloud architecture poses severe threats to privacy and data sovereignty:
            </p>
            
            <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <strong style={{ color: '#f0f0f0' }}>Data Retention & Uncontrolled Backups:</strong> Cloud servers often retain temporary snapshots, access logs, and server cache files long after your session ends.
              </li>
              <li>
                <strong style={{ color: '#f0f0f0' }}>Risk of Server Breaches:</strong> Centralized databases containing thousands of user documents are lucrative targets for hackers and automated scraping bots.
              </li>
              <li>
                <strong style={{ color: '#f0f0f0' }}>AI Scraping & Telemetry:</strong> Many modern web tools feed uploaded document text directly into Large Language Models (LLMs) or analytics systems for machine learning training.
              </li>
              <li>
                <strong style={{ color: '#f0f0f0' }}>Regulatory Non-Compliance:</strong> Uploading documents containing sensitive Personally Identifiable Information (PII), medical data, or bank records to uncertified servers violates <strong>GDPR, HIPAA, and CCPA</strong> mandates.
              </li>
            </ul>
          </div>
        </article>

        {/* Pillar 2: The In-Browser WebAssembly Solution */}
        <article className="card-glass" style={{ borderRadius: '1.25rem', padding: '2.5rem 2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Cpu size={20} color="#4d6bfa" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>
              How Client-Side In-Browser PDF Processing Works
            </h3>
          </div>

          <div style={{ color: 'rgba(240,240,240,0.72)', fontSize: '0.96rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              <strong>Adwyzors Private PDF Editor</strong> is built on a modern zero-server architecture. Instead of transmitting your file to remote cloud clusters, our editor executes all PDF parsing, vector rendering, font replacement, and document reconstruction directly inside your web browser’s memory using <strong>HTML5 Canvas, Web Workers, and WebAssembly (WASM)</strong>.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', margin: '0.75rem 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <div style={{ color: '#7c9aff', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={15} /> 1. In-Memory Sandbox
                </div>
                <div style={{ fontSize: '0.88rem' }}>
                  Your PDF file is loaded into an isolated <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.3rem', borderRadius: 4 }}>ArrayBuffer</code> in your browser&apos;s local RAM. Not a single byte is sent over network sockets.
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Globe size={15} /> 2. Local Font & Glyph Mapping
                </div>
                <div style={{ fontSize: '0.88rem' }}>
                  The editor identifies text runs, bounding rectangles, and typographic parameters directly via client-side workers, allowing click-to-edit interactions.
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <div style={{ color: '#f59e0b', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Server size={15} /> 3. Zero Cloud Footprint
                </div>
                <div style={{ fontSize: '0.88rem' }}>
                  When you click &ldquo;Download PDF&rdquo;, the new binary file is synthesized locally in-browser and downloaded straight to your disk without touching any external API.
                </div>
              </div>
            </div>

            <p>
              You can verify this complete data isolation at any time by opening your browser’s <em>Developer Tools (F12) &rarr; Network tab</em>. When you upload, edit, or download a PDF on this site, zero document data packets are transmitted.
            </p>
          </div>
        </article>

        {/* Pillar 3: Ideal Use Cases */}
        <article className="card-glass" style={{ borderRadius: '1.25rem', padding: '2.5rem 2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={20} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>
              Common Confidential Document Use Cases
            </h3>
          </div>

          <div style={{ color: 'rgba(240,240,240,0.72)', fontSize: '0.96rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              Because your documents never leave your computer, Adwyzors Private PDF Editor is trusted by security-first professionals across diverse industries:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#f0f0f0', display: 'block', marginBottom: '0.25rem' }}>Bank Statements & Financial Records</strong>
                <span style={{ fontSize: '0.88rem' }}>Modify balances, dates, or account lines without risking financial identity theft or exposing routing numbers to cloud storage.</span>
                <div style={{ marginTop: '0.5rem' }}>
                  <CustomLink href="/edit-bank-statement-pdf" style={{ color: '#7c9aff', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
                    Read Bank Statement Guide &rarr;
                  </CustomLink>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#f0f0f0', display: 'block', marginBottom: '0.25rem' }}>Legal Contracts & NDAs</strong>
                <span style={{ fontSize: '0.88rem' }}>Attorneys and business executives can correct clauses, names, and typographical errors under strict client confidentiality and non-disclosure obligations.</span>
                <div style={{ marginTop: '0.5rem' }}>
                  <CustomLink href="/secure-pdf-editor" style={{ color: '#7c9aff', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
                    Read Legal & Security Guide &rarr;
                  </CustomLink>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#f0f0f0', display: 'block', marginBottom: '0.25rem' }}>Redacting PII & Confidential Text</strong>
                <span style={{ fontSize: '0.88rem' }}>Permanently remove Social Security Numbers, tax identifiers, and credit card figures before emailing documents to third parties.</span>
                <div style={{ marginTop: '0.5rem' }}>
                  <CustomLink href="/redact-pdf-in-browser" style={{ color: '#7c9aff', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
                    Read Redaction Guide &rarr;
                  </CustomLink>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: '#f0f0f0', display: 'block', marginBottom: '0.25rem' }}>Resumes & Job Application Portfolios</strong>
                <span style={{ fontSize: '0.88rem' }}>Update contact information, dates of employment, and portfolio URLs instantly on your CV without watermark restrictions or paid software.</span>
                <div style={{ marginTop: '0.5rem' }}>
                  <CustomLink href="/chrome-pdf-editor" style={{ color: '#7c9aff', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
                    Read Chrome In-Browser Guide &rarr;
                  </CustomLink>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Pillar 4: How to Edit Any PDF Online in 4 Simple Steps */}
        <article className="card-glass" style={{ borderRadius: '1.25rem', padding: '2.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={20} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>
              How to Edit PDF Text Online for Free (Step-by-Step)
            </h3>
          </div>

          <div style={{ color: 'rgba(240,240,240,0.72)', fontSize: '0.96rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(77,107,250,0.2)', color: '#7c9aff', width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem'
              }}>1</div>
              <div>
                <strong style={{ color: '#f0f0f0' }}>Select or Drag & Drop Your PDF:</strong> Click the upload box at the top of this page to choose your PDF file. The document is opened instantly in your browser tab without any network upload.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(77,107,250,0.2)', color: '#7c9aff', width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem'
              }}>2</div>
              <div>
                <strong style={{ color: '#f0f0f0' }}>Click on Any Text Element to Edit:</strong> Hover over the text block you wish to modify. Click on the text to open the inline editor. Type your new text or delete unwanted content.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(77,107,250,0.2)', color: '#7c9aff', width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem'
              }}>3</div>
              <div>
                <strong style={{ color: '#f0f0f0' }}>Customize Styling & Add New Text:</strong> Adjust the font family (Helvetica, Times, Courier), font size, weight (bold, italic), and text color from the floating toolbar. You can also click &ldquo;Add Text Field&rdquo; to insert new annotations anywhere on the page.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(77,107,250,0.2)', color: '#7c9aff', width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem'
              }}>4</div>
              <div>
                <strong style={{ color: '#f0f0f0' }}>Export & Download Instantly:</strong> When you are satisfied with your edits, click the green &ldquo;Download PDF&rdquo; button. Your edited PDF will be generated locally and saved to your device immediately.
              </div>
            </div>

            <div style={{
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '0.75rem', padding: '1rem 1.25rem', marginTop: '0.5rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#a7f3d0', fontSize: '0.9rem'
            }}>
              <Check size={18} style={{ flexShrink: 0, color: '#34d399' }} />
              <span><strong>100% Free Forever:</strong> No watermarks, no trial expiration, and no subscription popups ever.</span>
            </div>
          </div>
        </article>

      </div>
    </section>
  );
}
