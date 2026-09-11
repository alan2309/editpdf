import { useState, useEffect } from 'react';
import { FileText, Menu, X, Shield } from 'lucide-react';
import { CustomLink, useRouter } from '../context/RouterContext';

const toolLinks = [
  { href: '/merge-pdf', label: 'Merge PDF' },
  { href: '/split-pdf', label: 'Split PDF' },
  { href: '/extract-pdf-pages', label: 'Extract Pages' },
  { href: '/delete-pdf-pages', label: 'Delete Pages' },
  { href: '/reorder-pdf-pages', label: 'Reorder Pages' },
  { href: '/rotate-pdf', label: 'Rotate PDF' },
  { href: '/compress-pdf', label: 'Compress PDF' },
  { href: '/pdf-to-jpg', label: 'PDF to JPG' },
  { href: '/pdf-to-png', label: 'PDF to PNG' },
  { href: '/jpg-to-pdf', label: 'JPG to PDF' },
  { href: '/png-to-pdf', label: 'PNG to PDF' },
  { href: '/watermark-pdf', label: 'Watermark PDF' },
  { href: '/pdf-page-numbers', label: 'Page Numbers' },
  { href: '/flatten-pdf', label: 'Flatten PDF' },
  { href: '/protect-pdf', label: 'Protect PDF' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const { currentPath } = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolMenuOpen(false);
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
          background: 'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <CustomLink href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4d6bfa, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(77,107,250,0.4)',
            }}>
              <FileText size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f0f0f0', letterSpacing: '-0.02em' }}>
              Edit<span style={{ background: 'linear-gradient(135deg,#4d6bfa,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PDF</span>
            </span>
          </CustomLink>

          {/* Desktop Nav links */}
          <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CustomLink
              href="/"
              style={{
                color: currentPath === '/' ? '#f0f0f0' : 'rgba(240,240,240,0.65)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.45rem 0.85rem',
                borderRadius: '0.5rem',
                background: currentPath === '/' ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              PDF Editor
            </CustomLink>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                aria-expanded={toolMenuOpen}
                aria-haspopup="menu"
                onClick={() => setToolMenuOpen(open => !open)}
                style={{
                  color: toolLinks.some(tool => tool.href === currentPath) ? '#f0f0f0' : 'rgba(240,240,240,0.65)',
                  background: toolMenuOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.45rem 0.85rem',
                }}
              >
                All Tools
              </button>

              {toolMenuOpen && (
                <div
                  role="menu"
                  aria-label="PDF tools"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.65rem)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 420,
                    maxWidth: 'calc(100vw - 2rem)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '0.35rem',
                    padding: '0.65rem',
                    background: '#15151f',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 18px 45px rgba(0,0,0,0.45)',
                  }}
                >
                  {toolLinks.map(tool => (
                    <CustomLink
                      key={tool.href}
                      href={tool.href}
                      role="menuitem"
                      onClick={() => setToolMenuOpen(false)}
                      style={{
                        color: currentPath === tool.href ? '#ffffff' : 'rgba(240,240,240,0.72)',
                        background: currentPath === tool.href ? 'rgba(77,107,250,0.18)' : 'transparent',
                        borderRadius: '0.45rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        padding: '0.6rem 0.7rem',
                        textDecoration: 'none',
                      }}
                    >
                      {tool.label}
                    </CustomLink>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/#faq"
              style={{
                color: 'rgba(240,240,240,0.65)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.45rem 0.85rem',
                borderRadius: '0.5rem',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              FAQ
            </a>
          </div>

          {/* Desktop Badge */}
          <div className="nav-desktop-badge" style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)',
            borderRadius: '2rem', padding: '0.3rem 0.85rem', fontSize: '0.75rem', color: '#7c9aff',
            fontWeight: 600,
          }}>
            <Shield size={13} color="#4ade80" />
            <span>100% Private</span>
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
            <div style={{ color: 'rgba(240,240,240,0.5)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', padding: '0.45rem 1rem', textTransform: 'uppercase' }}>
              PDF Tools
            </div>
            {toolLinks.map(tool => (
              <CustomLink
                key={tool.href}
                href={tool.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.65rem 1rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: currentPath === tool.href ? '#f0f0f0' : 'rgba(240,240,240,0.7)',
                  background: currentPath === tool.href ? 'rgba(77,107,250,0.12)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {tool.label}
              </CustomLink>
            ))}
          </div>

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
