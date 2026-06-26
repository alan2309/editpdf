import { FileText, Shield, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.015)',
      padding: '3rem 1.5rem 2rem',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #4d6bfa, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={15} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f0f0' }}>EditPDF</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'rgba(240,240,240,0.4)', lineHeight: 1.65, margin: 0 }}>
              A free, private PDF text editor that runs entirely in your browser. No cloud. No account. No tracking.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(240,240,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem' }}>
                Tool
              </h4>
              {['Editor', 'How it Works', 'FAQ'].map(label => (
                <a key={label} href={`#${label.toLowerCase().replace(/ /g, '-')}`} style={{
                  display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem',
                  color: 'rgba(240,240,240,0.5)', textDecoration: 'none', transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,240,240,0.5)')}>
                  {label}
                </a>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(240,240,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.875rem' }}>
                Adwyzors
              </h4>
              {[
                { label: 'QR Generator', href: 'https://qrgen.adwyzors.com' },
                { label: 'Main Site', href: 'https://adwyzors.com' },
              ].map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem',
                  fontSize: '0.875rem', color: 'rgba(240,240,240,0.5)', textDecoration: 'none', transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,240,240,0.5)')}>
                  {link.label} <ExternalLink size={11} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '1.5rem',
          display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
          alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.78rem', color: 'rgba(240,240,240,0.3)',
        }}>
          <span>© {currentYear} Adwyzors. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Shield size={12} />
            Your files never leave your device
          </span>
        </div>
      </div>
    </footer>
  );
}
