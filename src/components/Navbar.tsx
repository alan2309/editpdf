import { FileText } from 'lucide-react';

export default function Navbar() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        </a>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {[
            { href: '#editor', label: 'Editor' },
            { href: '#how-it-works', label: 'How it works' },
            { href: '#faq', label: 'FAQ' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: 'rgba(240,240,240,0.55)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLAnchorElement).style.color = '#f0f0f0';
                (e.target as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLAnchorElement).style.color = 'rgba(240,240,240,0.55)';
                (e.target as HTMLAnchorElement).style.background = 'transparent';
              }}
            >
              {link.label}
            </a>
          ))}
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
