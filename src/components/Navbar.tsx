import { useState } from 'react';
import { FileText, ChevronDown, Shield, Sparkles } from 'lucide-react';
import { CustomLink, useRouter } from '../context/RouterContext';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentPath } = useRouter();

  const useCases = [
    { label: 'Secure PDF Editor (Legal/HIPAA)', href: '/secure-pdf-editor' },
    { label: 'Edit Bank Statement PDF', href: '/edit-bank-statement-pdf' },
    { label: 'Redact PDF in Browser', href: '/redact-pdf-in-browser' },
    { label: 'Chrome PDF Editor', href: '/chrome-pdf-editor' },
  ];

  return (
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

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
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

        {/* Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)',
          borderRadius: '2rem', padding: '0.3rem 0.85rem', fontSize: '0.75rem', color: '#7c9aff',
          fontWeight: 600,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
          100% Private
        </div>
      </div>
    </nav>
  );
}
