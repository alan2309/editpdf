import { Shield, Lock, Eye, Server, Database, Globe, CheckCircle } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';

export default function PrivacyPolicyPage() {
  return (
    <div>
      <section style={{ padding: '4rem 0 2rem', maxWidth: 820, margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '2rem', padding: '0.35rem 0.9rem', fontSize: '0.8rem', color: '#34d399', fontWeight: 600,
            marginBottom: '0.75rem',
          }}>
            <Shield size={13} />
            Zero Data Collection
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '0.98rem', lineHeight: 1.65, maxWidth: 600, margin: '0 auto' }}>
            Last updated: August 15, 2026 · Effective immediately
          </p>
        </div>

        {/* Key Privacy Promise */}
        <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '2rem', marginBottom: '2.5rem', borderColor: 'rgba(16,185,129,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Our Core Privacy Promise</h2>
          </div>
          <p style={{ color: 'rgba(240,240,240,0.7)', fontSize: '0.92rem', lineHeight: 1.8, margin: 0 }}>
            <strong>EditPDF by Adwyzors does not collect, process, store, or transmit any of your personal data or document contents.</strong> Your PDF files are processed 100% locally inside your web browser using client-side JavaScript and WebAssembly. Not a single byte of your documents is ever uploaded to our servers or any third party.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>

          {/* What We Don't Collect */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Eye size={20} color="#4d6bfa" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>What We Do NOT Collect</h2>
            </div>
            <div style={{ color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>No document data:</strong> Your PDF file content, text edits, images, and metadata are never transmitted to any server.</li>
                <li><strong>No personal information:</strong> We do not ask for your name, email, phone number, or any identifying information. No account creation is required.</li>
                <li><strong>No cookies for tracking:</strong> We do not use tracking cookies, advertising pixels, or analytics that identify individual users.</li>
                <li><strong>No usage telemetry:</strong> We do not log what you type, what files you open, or how you use the editor.</li>
                <li><strong>No IP address logging:</strong> We do not store or process your IP address beyond standard web server access logs (which are rotated and not linked to user identity).</li>
              </ul>
            </div>
          </div>

          {/* How It Works Technically */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Server size={20} color="#8b5cf6" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>How Client-Side Processing Works</h2>
            </div>
            <div style={{ color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <p>When you load a PDF in EditPDF:</p>
              <ol style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>The PDF binary is read via the browser's native <code>FileReader</code> API into your device's local memory (RAM).</li>
                <li>PDF parsing, text extraction, and rendering are performed entirely by JavaScript and WebAssembly running in your browser's sandboxed V8/SpiderMonkey engine.</li>
                <li>When you edit text, changes are applied to an in-memory representation of the PDF.</li>
                <li>When you click "Download", a new PDF is generated client-side and saved to your local device.</li>
                <li>When you close the browser tab, all data is purged from memory. Nothing persists.</li>
              </ol>
              <p style={{ marginTop: '1rem' }}>
                <strong>You can verify this yourself:</strong> Open your browser's Developer Tools → Network tab. You will see zero outbound requests containing document data during the entire editing session.
              </p>
            </div>
          </div>

          {/* Third-Party Services */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Globe size={20} color="#4d6bfa" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Third-Party Services</h2>
            </div>
            <div style={{ color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 0.75rem' }}>EditPDF uses the following external services, none of which have access to your document data:</p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>Google Fonts (fonts.googleapis.com):</strong> Used to load the Inter typeface. Google Fonts does not set cookies or track users in compliance with GDPR.</li>
                <li><strong>Static web hosting:</strong> Our HTML, CSS, and JavaScript files are served from a CDN. Only static assets are served — no server-side document processing occurs.</li>
              </ul>
            </div>
          </div>

          {/* Regulatory Compliance */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Database size={20} color="#10b981" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Regulatory Compliance</h2>
            </div>
            <div style={{ color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}>
                Because EditPDF processes zero personal data on remote servers, our architecture inherently complies with data protection regulations:
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: '0.75rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>GDPR (EU):</strong> No personal data is processed by us, eliminating data controller/processor obligations.</li>
                <li><strong>CCPA (California):</strong> No personal information is sold, shared, or collected.</li>
                <li><strong>HIPAA (US Healthcare):</strong> Since Protected Health Information (PHI) never leaves your device, no Business Associate Agreement (BAA) is required.</li>
              </ul>
            </div>
          </div>

          {/* Changes to Policy */}
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Changes to This Policy</h2>
            <p style={{ color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8, margin: 0 }}>
              If we ever change this policy, the updated version will be posted on this page with a new "Last updated" date. Our fundamental commitment — zero document data collection — will not change.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Contact</h2>
            <p style={{ color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8, margin: 0 }}>
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:contact@adwyzors.com" style={{ color: '#7c9aff', textDecoration: 'none' }}>contact@adwyzors.com</a>.
            </p>
          </div>

        </div>

        {/* Back link */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '3rem', paddingTop: '2rem', textAlign: 'center' }}>
          <CustomLink href="/" style={{ color: '#4d6bfa', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to PDF Editor
          </CustomLink>
        </div>
      </section>
    </div>
  );
}
