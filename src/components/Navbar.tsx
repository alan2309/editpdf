import { useState, useEffect, useRef } from 'react';
import { FileText, ChevronDown, Menu, X } from 'lucide-react';
import { CustomLink, useRouter } from '../context/RouterContext';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPath } = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const useCases = [
    { label: 'Secure PDF Editor (Legal/HIPAA)', href: '/secure-pdf-editor' },
    { label: 'Edit Bank Statement PDF', href: '/edit-bank-statement-pdf' },
    { label: 'Redact PDF in Browser', href: '/redact-pdf-in-browser' },
    { label: 'Chrome PDF Editor', href: '/chrome-pdf-editor' },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

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

          {/* Desktop Nav links — hidden below 768px */}
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
              Editor
            </CustomLink>

            {/* Tools & Use Cases Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: dropdownOpen || currentPath !== '/' ? 'rgba(77,107,250,0.12)' : 'transparent',
                  border: 'none',
                  color: dropdownOpen || currentPath !== '/' ? '#7c9aff' : 'rgba(240,240,240,0.6)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s',
                }}
              >
                <span>Use Cases & Tools</span>
                <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {dropdownOpen && (
                <div
                  className="card-glass"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: '260px',
                    borderRadius: '0.875rem',
                    padding: '0.5rem',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                    zIndex: 100,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: '#111118',
                  }}
                >
                  {useCases.map(uc => (
                    <CustomLink
                      key={uc.href}
                      href={uc.href}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        color: currentPath === uc.href ? '#4d6bfa' : '#f0f0f0',
                        background: currentPath === uc.href ? 'rgba(77,107,250,0.1)' : 'transparent',
                        textDecoration: 'none',
                        fontWeight: 500,
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.target as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLAnchorElement).style.background = currentPath === uc.href ? 'rgba(77,107,250,0.1)' : 'transparent';
                      }}
                    >
                      {uc.label}
                    </CustomLink>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/#guide"
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
              Guide
            </a>

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

          {/* Desktop Badge — hidden below 768px */}
          <div className="nav-desktop-badge" style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)',
            borderRadius: '2rem', padding: '0.3rem 0.85rem', fontSize: '0.75rem', color: '#7c9aff',
            fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
            100% Private
          </div>

          {/* Mobile Hamburger Button — visible below 768px */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            style={{
              display: 'none', /* shown via media query */
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

      {/* Mobile Menu Overlay — slides down from nav */}
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
          display: 'none', /* shown via media query */
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {/* Main links */}
          <CustomLink
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'block',
              padding: '0.85rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: currentPath === '/' ? '#f0f0f0' : 'rgba(240,240,240,0.7)',
              background: currentPath === '/' ? 'rgba(77,107,250,0.12)' : 'transparent',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
          >
            🏠 Editor (Home)
          </CustomLink>

          {/* Use Cases Section */}
          <div style={{
            padding: '0.5rem 1rem 0.25rem',
            marginTop: '0.5rem',
          }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'rgba(240,240,240,0.35)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              Use Cases & Tools
            </span>
          </div>

          {useCases.map(uc => (
            <CustomLink
              key={uc.href}
              href={uc.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: currentPath === uc.href ? '#7c9aff' : 'rgba(240,240,240,0.7)',
                background: currentPath === uc.href ? 'rgba(77,107,250,0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              {uc.label}
            </CustomLink>
          ))}

          {/* Section links */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
            <a
              href="/#guide"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
              }}
            >
              📖 Client-Side Security Guide
            </a>
            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
              }}
            >
              ❓ FAQ
            </a>
          </div>

          {/* Mobile Privacy Badge */}
          <div style={{
            marginTop: '1.5rem',
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
