import { useState, useEffect } from 'react';
import { FileText, Menu, X } from 'lucide-react';
import { CustomLink, useRouter } from '../context/RouterContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPath } = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,15,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <CustomLink href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4d6bfa, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(77,107,250,0.4)',
            }}>
              <FileText size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f0', letterSpacing: '-0.02em' }}>
              Edit<span style={{ background: 'linear-gradient(135deg,#4d6bfa,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PDF</span>
            </span>
          </CustomLink>

          {/* Desktop Nav links */}
          <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CustomLink
              href="/"
              style={{
                color: currentPath === '/' ? '#f0f0f0' : 'rgba(240,240,240,0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                background: currentPath === '/' ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              PDF Editor
            </CustomLink>

            <a
              href="/#faq"
              style={{
                color: 'rgba(240,240,240,0.6)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              FAQ
            </a>
          </div>

          {/* Desktop Badge */}
          <div className="nav-desktop-badge" style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)',
            borderRadius: '2rem', padding: '0.3rem 0.85rem', fontSize: '0.75rem', color: '#7c9aff',
            fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
            100% Private
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            style={{
              display: 'none',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              color: '#f0f0f0',
              cursor: 'pointer',
              padding: '0.4rem',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className="nav-mobile-overlay"
        style={{
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 49,
          background: 'rgba(10,10,15,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-120%)',
          opacity: mobileMenuOpen ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease',
          overflowY: 'auto',
          display: 'none',
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <CustomLink
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'block',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: currentPath === '/' ? '#f0f0f0' : 'rgba(240,240,240,0.7)',
              background: currentPath === '/' ? 'rgba(77,107,250,0.12)' : 'transparent',
              textDecoration: 'none',
            }}
          >
            📄 PDF Editor
          </CustomLink>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '0.65rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.9rem',
                color: 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
              }}
            >
              ❓ FAQ
            </a>
          </div>

          <div style={{
            marginTop: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            background: 'rgba(77,107,250,0.08)', border: '1px solid rgba(77,107,250,0.2)',
            borderRadius: '1rem', padding: '0.75rem 1rem',
            fontSize: '0.82rem', color: '#7c9aff', fontWeight: 600,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
            100% Private · Zero Server Upload
          </div>
        </div>
      </div>
    </>
  );
}
