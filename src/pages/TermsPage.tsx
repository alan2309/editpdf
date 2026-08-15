import { FileText, AlertTriangle } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';

export default function TermsPage() {
  return (
    <div>
      <section style={{ padding: '4rem 0 2rem', maxWidth: 820, margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)',
            borderRadius: '2rem', padding: '0.35rem 0.9rem', fontSize: '0.8rem', color: '#7c9aff', fontWeight: 600,
            marginBottom: '0.75rem',
          }}>
            <FileText size={13} />
            Legal
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '0.98rem', lineHeight: 1.65, maxWidth: 600, margin: '0 auto' }}>
            Last updated: August 15, 2026 · Effective immediately
          </p>
        </div>

        {/* Terms Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8 }}>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>1. Acceptance of Terms</h2>
            <p style={{ margin: 0 }}>
              By accessing and using EditPDF by Adwyzors ("the Service"), available at editpdf.adwyzors.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>2. Service Description</h2>
            <p style={{ margin: 0 }}>
              EditPDF is a free, in-browser PDF text editor. The Service processes PDF files entirely on your local device using client-side JavaScript and WebAssembly technology. No document data is uploaded to, processed by, or stored on our servers at any time.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>3. User Responsibilities</h2>
            <p style={{ margin: '0 0 0.75rem' }}>By using EditPDF, you agree to:</p>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Use the Service only for lawful purposes and in accordance with all applicable local, state, national, and international laws.</li>
              <li>Not use the Service to edit documents for the purpose of fraud, forgery, identity theft, or any other illegal activity.</li>
              <li>Take responsibility for the content you create, modify, or distribute using this tool.</li>
              <li>Ensure you have the legal right to edit any documents you process through the Service.</li>
            </ul>
          </div>

          <div className="card-glass" style={{ borderRadius: '1rem', padding: '1.5rem', borderColor: 'rgba(245,158,11,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <AlertTriangle size={18} color="#f59e0b" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>4. Disclaimer — No Illegal Use</h2>
            </div>
            <p style={{ margin: 0 }}>
              EditPDF is intended for legitimate document editing purposes only, such as correcting typos, updating personal information, redacting sensitive data before sharing, or modifying your own documents. <strong>Any use of this tool to forge, falsify, or fraudulently alter official documents (including but not limited to bank statements, government IDs, academic transcripts, court records, or contracts) is strictly prohibited</strong> and may constitute a criminal offense under applicable law. Adwyzors bears no liability for any misuse of this tool.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>5. Intellectual Property</h2>
            <p style={{ margin: 0 }}>
              The EditPDF software, design, branding, and all related materials are the intellectual property of Adwyzors. You may not copy, modify, distribute, or reverse-engineer the Service software without prior written consent.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>6. Service Availability & Warranty</h2>
            <p style={{ margin: 0 }}>
              EditPDF is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or available at all times. We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>7. Limitation of Liability</h2>
            <p style={{ margin: 0 }}>
              To the maximum extent permitted by law, Adwyzors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of profits, or business interruption, arising from your use of the Service. Because all processing occurs on your local device, data loss resulting from browser crashes, device failures, or user error is solely your responsibility.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>8. Changes to Terms</h2>
            <p style={{ margin: 0 }}>
              We reserve the right to update these Terms of Service at any time. Updated terms will be posted on this page with a revised "Last updated" date. Continued use of the Service after any changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>9. Governing Law</h2>
            <p style={{ margin: 0 }}>
              These Terms shall be governed by and construed in accordance with the applicable laws. Any disputes arising out of or related to these Terms shall be resolved through appropriate legal channels.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>10. Contact</h2>
            <p style={{ margin: 0 }}>
              For questions about these terms, contact us at{' '}
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
