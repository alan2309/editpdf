import { FileText, Shield, ExternalLink, Lock, CheckCircle } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.015)',
      padding: '4rem 1.5rem 2.5rem',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3.5rem' }}>
          
          {/* Brand Column */}
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #4d6bfa, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={15} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f0f0f0' }}>EditPDF</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'rgba(240,240,240,0.45)', lineHeight: 1.7, margin: '0 0 1rem' }}>
              100% private, in-browser PDF text editor. Built with modern WebAssembly and HTML5 Canvas. Zero cloud storage, zero tracking.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.78rem', background: 'rgba(74,222,128,0.08)', padding: '0.3rem 0.75rem', borderRadius: '1rem', border: '1px solid rgba(74,222,128,0.2)' }}>
              <CheckCircle size={12} />
              <span>HIPAA & GDPR Privacy Friendly</span>
            </div>
          </div>

          {/* Hub Navigation Links */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(240,240,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem' }}>
              Main Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <CustomLink href="/" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                Private PDF Editor (Hub)
              </CustomLink>
              <a href="/#how-it-works" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                How It Works
              </a>
              <a href="/#guide" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                Client-Side Security Guide
              </a>
              <a href="/#faq" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                Frequently Asked Questions
              </a>
            </div>
          </div>

          {/* Spoke Pages Directory (Hub and Spoke Authority Cluster) */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(240,240,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem' }}>
              Specialized Solutions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <CustomLink href="/secure-pdf-editor" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                Secure PDF Editor (Confidential)
              </CustomLink>
              <CustomLink href="/edit-bank-statement-pdf" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                Edit Bank Statement PDF
              </CustomLink>
              <CustomLink href="/redact-pdf-in-browser" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                Redact PDF in Browser
              </CustomLink>
              <CustomLink href="/chrome-pdf-editor" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                Google Chrome PDF Editor
              </CustomLink>
            </div>
          </div>

          {/* Adwyzors Network + Legal */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(240,240,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem' }}>
              Adwyzors Network
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a href="https://qrgen.adwyzors.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                <span>Free QR Generator</span>
                <ExternalLink size={11} />
              </a>
              <a href="https://adwyzors.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                <span>Adwyzors Main Site</span>
                <ExternalLink size={11} />
              </a>
            </div>

            {/* Legal Links */}
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(240,240,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '1.5rem 0 0.75rem' }}>
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <CustomLink href="/privacy-policy" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                Privacy Policy
              </CustomLink>
              <CustomLink href="/about" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                About Us
              </CustomLink>
              <CustomLink href="/terms" style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)', textDecoration: 'none' }}>
                Terms of Service
              </CustomLink>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '1.75rem',
          display: 'flex', flexWrap: 'wrap', gap: '1rem',
          alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.8rem', color: 'rgba(240,240,240,0.4)',
        }}>
          <span>© {currentYear} Adwyzors. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7c9aff' }}>
            <Lock size={13} />
            Zero Server Uploads · Files Processed 100% Locally
          </span>
        </div>
      </div>
    </footer>
  );
}
