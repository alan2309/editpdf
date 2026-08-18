import { ShieldCheck, Cpu, Lock, FileSpreadsheet, Scale, CheckCircle2, XCircle, ArrowRight, Layers, EyeOff, Sparkles, ServerCrash } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';

export default function UltimateGuide() {
  const comparisonData = [
    {
      feature: 'Document Data Transmission',
      clientSide: '0 KB (100% Local in Browser)',
      cloudTools: '100% Uploaded to Cloud Servers',
      adobe: 'Uploaded to Cloud / Desktop Sync',
    },
    {
      feature: 'Privacy & Confidentiality',
      clientSide: 'Guaranteed (Zero Server Storage)',
      cloudTools: 'Stored on 3rd-party servers (risk of breach)',
      adobe: 'Requires Adobe Account & Cloud sync',
    },
    {
      feature: 'HIPAA & GDPR Compliance',
      clientSide: 'Inherent (No 3rd party processing)',
      cloudTools: 'Requires enterprise BAA & DPA contracts',
      adobe: 'Requires enterprise tiers',
    },
    {
      feature: 'Subscription / Cost',
      clientSide: '100% Free Forever',
      cloudTools: '$10 - $25 / month or capped limits',
      adobe: '$19.99 - $29.99 / month',
    },
    {
      feature: 'Account / Registration',
      clientSide: 'No Signup Required',
      cloudTools: 'Required for multi-edits',
      adobe: 'Adobe ID Login required',
    },
    {
      feature: 'Execution Speed',
      clientSide: 'Instant (Zero Upload/Download lag)',
      cloudTools: 'Slow (Queueing, upload & download)',
      adobe: 'Heavy desktop launch',
    },
    {
      feature: 'Offline Capability',
      clientSide: 'Works fully offline once loaded',
      cloudTools: 'Fails without internet',
      adobe: 'Desktop works, Web fails',
    },
  ];

  const spokePages = [
    {
      title: 'Secure PDF Editor',
      path: '/secure-pdf-editor',
      badge: 'Legal & Medical Grade',
      desc: 'Engineered for attorneys, clinicians, and HR managers handling confidential files under strict NDA, HIPAA, and GDPR rules.',
      icon: <Lock size={20} color="#4d6bfa" />,
    },
    {
      title: 'Edit Bank Statement PDF',
      path: '/edit-bank-statement-pdf',
      badge: 'Financial Privacy',
      desc: 'Safely correct figures, dates, and descriptions on bank statements and tax returns without exposing account numbers to cloud servers.',
      icon: <FileSpreadsheet size={20} color="#10b981" />,
    },
    {
      title: 'Redact PDF in Browser',
      path: '/redact-pdf-in-browser',
      badge: 'PII Sanitization',
      desc: 'Permanently remove Social Security Numbers, credit card details, and confidential text without risk of underlying metadata leaks.',
      icon: <EyeOff size={20} color="#f59e0b" />,
    },
    {
      title: 'Chrome PDF Editor',
      path: '/chrome-pdf-editor',
      badge: 'Extension-Free',
      desc: 'High-performance WebAssembly text editing directly inside Google Chrome, Microsoft Edge, and Brave browser tabs.',
      icon: <Cpu size={20} color="#8b5cf6" />,
    },
  ];

  return (
    <section id="guide" style={{ padding: '6rem 0', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)',
            borderRadius: '2rem', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#7c9aff', fontWeight: 600,
            marginBottom: '1rem',
          }}>
            <Sparkles size={14} />
            Authoritative Technical Guide
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 1rem' }}>
            The Ultimate Guide to <span className="text-gradient">Client-Side PDF Editing</span>
          </h2>
          <p style={{ color: 'rgba(240,240,240,0.6)', fontSize: '1.05rem', maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>
            Why browser-based, zero-upload PDF technology is replacing insecure cloud services for legal, financial, and private document workflows.
          </p>
        </div>

        {/* Pillar 1: The Hidden Risks of Cloud PDF Tools */}
        <article className="card-glass" style={{ borderRadius: '1.5rem', padding: '2.5rem 2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ServerCrash size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>
              The Hidden Security Risks of Cloud-Based PDF Editors
            </h3>
          </div>
          
          <div style={{ color: 'rgba(240,240,240,0.7)', fontSize: '0.95rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              When you use conventional online PDF editing tools (such as Adobe Cloud, Smallpdf, or iLovePDF), your document undergoes a silent and risky journey. 
              The moment you click &ldquo;Upload&rdquo;, your confidential document is transmitted across public networks to remote web servers. 
              On those servers, the file is temporarily written to disk or database clusters, decrypted, parsed by backend engines, and stored for processing.
            </p>
            <p>
              This legacy cloud architecture creates four critical vulnerabilities:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '1.25rem' }}>
                <strong style={{ color: '#fca5a5', display: 'block', marginBottom: '0.35rem', fontSize: '0.95rem' }}>1. Unregulated Server Retention</strong>
                <span style={{ fontSize: '0.875rem' }}>Cloud providers often retain files in server caches or backup snapshots for hours or days, leaving them vulnerable to rogue employees or unauthorized server access.</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '1.25rem' }}>
                <strong style={{ color: '#fca5a5', display: 'block', marginBottom: '0.35rem', fontSize: '0.95rem' }}>2. Data Breach Exposure</strong>
                <span style={{ fontSize: '0.875rem' }}>Centralized document storage repositories are prime targets for cyberattacks. A single server exploit can compromise thousands of sensitive contracts and tax filings.</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '1.25rem' }}>
                <strong style={{ color: '#fca5a5', display: 'block', marginBottom: '0.35rem', fontSize: '0.95rem' }}>3. Regulatory & Compliance Violations</strong>
                <span style={{ fontSize: '0.875rem' }}>Under regulations like <strong>GDPR (Article 28)</strong>, <strong>HIPAA</strong>, and <strong>CCPA</strong>, transferring Personally Identifiable Information (PII) to unvetted cloud tools without signed Data Processing Agreements creates immediate legal liability.</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '1.25rem' }}>
                <strong style={{ color: '#fca5a5', display: 'block', marginBottom: '0.35rem', fontSize: '0.95rem' }}>4. AI Model Scraping Risks</strong>
                <span style={{ fontSize: '0.875rem' }}>Many freemium cloud services include vague clauses in their terms of service allowing document telemetry and text corpus ingestion for machine learning training.</span>
              </div>
            </div>
          </div>
        </article>

        {/* Pillar 2: How Client-Side In-Browser Architecture Works */}
        <article className="card-glass" style={{ borderRadius: '1.5rem', padding: '2.5rem 2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Cpu size={22} color="#4d6bfa" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>
              How Browser-Based Client-Side PDF Technology Works
            </h3>
          </div>

          <div style={{ color: 'rgba(240,240,240,0.7)', fontSize: '0.95rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              Modern web browsers (powered by Chromium V8, SpiderMonkey, and JavaScriptCore engines) are no longer simple document viewers. 
              They are full-fledged, high-speed virtual machines equipped with <strong>WebAssembly (WASM)</strong> and <strong>HTML5 Canvas</strong> rendering engines. 
              EditPDF leverages these native browser capabilities to process your documents 100% locally on your own CPU and RAM.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
              <div style={{ borderLeft: '3px solid #4d6bfa', paddingLeft: '1rem', background: 'rgba(77,107,250,0.04)', borderRadius: '0 0.75rem 0.75rem 0', padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 700, color: '#f0f0f0', marginBottom: '0.25rem' }}>1. Local Binary Ingestion</div>
                <div style={{ fontSize: '0.85rem' }}>The HTML5 File API reads raw PDF bytes into a local ArrayBuffer in browser memory. Not one byte is sent to any HTTP endpoint.</div>
              </div>
              <div style={{ borderLeft: '3px solid #8b5cf6', paddingLeft: '1rem', background: 'rgba(139,92,246,0.04)', borderRadius: '0 0.75rem 0.75rem 0', padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 700, color: '#f0f0f0', marginBottom: '0.25rem' }}>2. Vector & Glyph Mapping</div>
                <div style={{ fontSize: '0.85rem' }}>A localized Web Worker parses PDF vector streams, resolving font glyphs, character matrices, bounding boxes, and geometric coordinates.</div>
              </div>
              <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '1rem', background: 'rgba(16,185,129,0.04)', borderRadius: '0 0.75rem 0.75rem 0', padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 700, color: '#f0f0f0', marginBottom: '0.25rem' }}>3. Point-and-Click DOM Overlay</div>
                <div style={{ fontSize: '0.85rem' }}>Interactive, floating editable nodes are calibrated to each text element’s exact baseline, allowing you to edit text intuitively.</div>
              </div>
              <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '1rem', background: 'rgba(245,158,11,0.04)', borderRadius: '0 0.75rem 0.75rem 0', padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 700, color: '#f0f0f0', marginBottom: '0.25rem' }}>4. Sanitization & PDF Generation</div>
                <div style={{ fontSize: '0.85rem' }}>Upon export, choose permanent stream-purged sanitization (rendering high-DPI layers that physically purge underlying text streams and metadata) or standard vector overlay.</div>
              </div>
            </div>

            <p>
              Because the entire pipeline executes inside your browser tab’s protected sandbox, your files remain completely invisible to anyone on the network—including us.
            </p>
          </div>
        </article>

        {/* Pillar 3: Comprehensive Comparison Matrix */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#f0f0f0' }}>
              Comparison: Client-Side In-Browser vs Traditional Cloud PDF Editors
            </h3>
            <p style={{ color: 'rgba(240,240,240,0.5)', fontSize: '0.95rem', margin: 0 }}>
              See why security-conscious organizations and professionals choose zero-upload browser editing.
            </p>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#f0f0f0' }}>Feature / Security Dimension</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#4d6bfa', background: 'rgba(77,107,250,0.08)' }}>EditPDF (Client-Side)</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'rgba(240,240,240,0.6)' }}>Cloud Converters (Smallpdf/iLovePDF)</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'rgba(240,240,240,0.6)' }}>Adobe Acrobat</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderBottom: i < comparisonData.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '1.125rem 1.5rem', fontWeight: 600, color: '#f0f0f0' }}>{row.feature}</td>
                    <td style={{ padding: '1.125rem 1.5rem', color: '#7c9aff', fontWeight: 600, background: 'rgba(77,107,250,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} color="#4ade80" />
                        <span>{row.clientSide}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.125rem 1.5rem', color: 'rgba(240,240,240,0.55)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <XCircle size={16} color="#ef4444" />
                        <span>{row.cloudTools}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.125rem 1.5rem', color: 'rgba(240,240,240,0.55)' }}>{row.adobe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pillar 4: Hub and Spoke Knowledge Network */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '2rem', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#c4b5fd', fontWeight: 600,
              marginBottom: '0.75rem',
            }}>
              <Layers size={14} />
              Specialized Privacy Hubs & Use Cases
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#f0f0f0' }}>
              Explore Dedicated Tools & Industry Solutions
            </h3>
            <p style={{ color: 'rgba(240,240,240,0.5)', fontSize: '0.95rem', maxWidth: 600, margin: '0 auto' }}>
              Discover how zero-upload PDF editing solves specialized compliance, redaction, and financial workflows.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {spokePages.map(spoke => (
              <CustomLink
                key={spoke.path}
                href={spoke.path}
                className="card-glass"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '1.25rem',
                  padding: '1.75rem 1.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s, border-color 0.2s, background 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(77,107,250,0.4)';
                  e.currentTarget.style.background = 'rgba(77,107,250,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {spoke.icon}
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, color: '#7c9aff',
                      background: 'rgba(77,107,250,0.12)', padding: '0.2rem 0.65rem', borderRadius: '1rem',
                      border: '1px solid rgba(77,107,250,0.2)',
                    }}>
                      {spoke.badge}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f0f0f0', margin: '0 0 0.5rem' }}>
                    {spoke.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.5)', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                    {spoke.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#4d6bfa', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>Open Tool & Guide</span>
                  <ArrowRight size={14} />
                </div>
              </CustomLink>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
