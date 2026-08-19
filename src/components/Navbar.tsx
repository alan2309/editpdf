import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Menu, X, ChevronDown, Combine, Scissors, Minimize2,
  Lock, RotateCw, FileOutput, Trash2, ArrowUpDown, Image as ImageIcon,
  FileUp, Stamp, Hash, Layers, ShieldCheck, Sparkles, Shield
} from 'lucide-react';
import { CustomLink, useRouter } from '../context/RouterContext';

interface ToolItem {
  name: string;
  href: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

interface ToolCategory {
  title: string;
  items: ToolItem[];
}

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    title: 'Organize & Pages',
    items: [
      {
        name: 'Merge PDF',
        href: '/merge-pdf',
        desc: 'Combine multiple PDFs into one document',
        icon: <Combine size={18} />,
        color: '#4d6bfa',
      },
      {
        name: 'Split PDF',
        href: '/split-pdf',
        desc: 'Split by pages, intervals or custom ranges',
        icon: <Scissors size={18} />,
        color: '#8b5cf6',
      },
      {
        name: 'Extract Pages',
        href: '/extract-pdf-pages',
        desc: 'Export specific pages into a new file',
        icon: <FileOutput size={18} />,
        color: '#06b6d4',
      },
      {
        name: 'Delete Pages',
        href: '/delete-pdf-pages',
        desc: 'Remove selected pages from document',
        icon: <Trash2 size={18} />,
        color: '#ef4444',
      },
      {
        name: 'Reorder Pages',
        href: '/reorder-pdf-pages',
        desc: 'Rearrange and sort page sequence',
        icon: <ArrowUpDown size={18} />,
        color: '#f59e0b',
      },
      {
        name: 'Rotate PDF',
        href: '/rotate-pdf',
        desc: 'Permanently rotate PDF orientation',
        icon: <RotateCw size={18} />,
        color: '#10b981',
      },
    ],
  },
  {
    title: 'Convert & Optimize',
    items: [
      {
        name: 'Compress PDF',
        href: '/compress-pdf',
        desc: 'Lossless structural stream optimization',
        icon: <Minimize2 size={18} />,
        color: '#ec4899',
        badge: 'QPDF',
      },
      {
        name: 'PDF to JPG',
        href: '/pdf-to-jpg',
        desc: 'Convert pages into high-res JPG images',
        icon: <ImageIcon size={18} />,
        color: '#6366f1',
      },
      {
        name: 'PDF to PNG',
        href: '/pdf-to-png',
        desc: 'Lossless crisp PNG image extraction',
        icon: <ImageIcon size={18} />,
        color: '#3b82f6',
      },
      {
        name: 'JPG to PDF',
        href: '/jpg-to-pdf',
        desc: 'Convert photos and scans to PDF',
        icon: <FileUp size={18} />,
        color: '#14b8a6',
      },
      {
        name: 'PNG to PDF',
        href: '/png-to-pdf',
        desc: 'Convert PNGs with clean transparency',
        icon: <FileUp size={18} />,
        color: '#84cc16',
      },
    ],
  },
  {
    title: 'Enhance & Security',
    items: [
      {
        name: 'Protect PDF',
        href: '/protect-pdf',
        desc: 'Standard AES-256 password encryption',
        icon: <Lock size={18} />,
        color: '#eab308',
        badge: 'AES-256',
      },
      {
        name: 'Watermark PDF',
        href: '/watermark-pdf',
        desc: 'Add custom text overlays with opacity',
        icon: <Stamp size={18} />,
        color: '#f43f5e',
      },
      {
        name: 'Page Numbers',
        href: '/pdf-page-numbers',
        desc: 'Insert custom headers and footers',
        icon: <Hash size={18} />,
        color: '#a855f7',
      },
      {
        name: 'Flatten PDF',
        href: '/flatten-pdf',
        desc: 'Lock interactive AcroForms & annotations',
        icon: <Layers size={18} />,
        color: '#0ea5e9',
      },
      {
        name: 'Secure Editor',
        href: '/secure-pdf-editor',
        desc: 'Private editing for legal and bank files',
        icon: <ShieldCheck size={18} />,
        color: '#22c55e',
      },
    ],
  },
];

export default function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPath } = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setToolsOpen(false);
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Click outside listener for desktop dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isToolActive = (href: string) => currentPath === href;
  const isAnyToolActive = TOOL_CATEGORIES.some(cat => cat.items.some(item => item.href === currentPath));

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,15,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand Logo */}
          <CustomLink href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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

          {/* Desktop Nav Items */}
          <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CustomLink
              href="/"
              style={{
                color: currentPath === '/' ? '#ffffff' : 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.45rem 0.85rem',
                borderRadius: '0.5rem',
                background: currentPath === '/' ? 'rgba(77,107,250,0.18)' : 'transparent',
                border: currentPath === '/' ? '1px solid rgba(77,107,250,0.3)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              PDF Editor
            </CustomLink>

            {/* All Tools Mega Menu Trigger */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setToolsOpen(!toolsOpen)}
                style={{
                  background: isAnyToolActive || toolsOpen ? 'rgba(77,107,250,0.18)' : 'transparent',
                  border: isAnyToolActive || toolsOpen ? '1px solid rgba(77,107,250,0.3)' : '1px solid transparent',
                  color: isAnyToolActive || toolsOpen ? '#ffffff' : 'rgba(240,240,240,0.7)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>All PDF Tools</span>
                <ChevronDown size={14} style={{ transform: toolsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* Desktop Mega Menu Dropdown */}
              {toolsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 780,
                    maxWidth: '92vw',
                    background: 'rgba(13,13,20,0.97)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(77,107,250,0.25)',
                    borderRadius: '1.25rem',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(77,107,250,0.15)',
                    padding: '1.5rem',
                    zIndex: 100,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                  }}
                >
                  {TOOL_CATEGORIES.map(category => (
                    <div key={category.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#7c9aff',
                        marginBottom: '0.25rem',
                        paddingBottom: '0.4rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        {category.title}
                      </div>

                      {category.items.map(tool => {
                        const active = isToolActive(tool.href);
                        return (
                          <CustomLink
                            key={tool.href}
                            href={tool.href}
                            onClick={() => setToolsOpen(false)}
                            style={{
                              textDecoration: 'none',
                              padding: '0.55rem 0.65rem',
                              borderRadius: '0.65rem',
                              background: active ? 'rgba(77,107,250,0.15)' : 'transparent',
                              border: active ? '1px solid rgba(77,107,250,0.3)' : '1px solid transparent',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.65rem',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                              if (!active) {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!active) {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                              }
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                background: `${tool.color}20`,
                                border: `1px solid ${tool.color}40`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: tool.color,
                                flexShrink: 0,
                                marginTop: 2,
                              }}
                            >
                              {tool.icon}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: active ? '#7c9aff' : '#f0f0f0' }}>
                                  {tool.name}
                                </span>
                                {tool.badge && (
                                  <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    background: 'rgba(77,107,250,0.2)',
                                    color: '#93c5fd',
                                    borderRadius: '0.35rem',
                                    padding: '0.1rem 0.35rem',
                                  }}>
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: '0.72rem', color: 'rgba(240,240,240,0.5)', margin: '2px 0 0', lineHeight: 1.3 }}>
                                {tool.desc}
                              </p>
                            </div>
                          </CustomLink>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Access to High-Priority Tools */}
            <CustomLink
              href="/merge-pdf"
              style={{
                color: currentPath === '/merge-pdf' ? '#ffffff' : 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                padding: '0.45rem 0.75rem',
                borderRadius: '0.5rem',
                background: currentPath === '/merge-pdf' ? 'rgba(77,107,250,0.18)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Merge
            </CustomLink>

            <CustomLink
              href="/split-pdf"
              style={{
                color: currentPath === '/split-pdf' ? '#ffffff' : 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                padding: '0.45rem 0.75rem',
                borderRadius: '0.5rem',
                background: currentPath === '/split-pdf' ? 'rgba(77,107,250,0.18)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Split
            </CustomLink>

            <CustomLink
              href="/compress-pdf"
              style={{
                color: currentPath === '/compress-pdf' ? '#ffffff' : 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                padding: '0.45rem 0.75rem',
                borderRadius: '0.5rem',
                background: currentPath === '/compress-pdf' ? 'rgba(77,107,250,0.18)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Compress
            </CustomLink>

            <CustomLink
              href="/protect-pdf"
              style={{
                color: currentPath === '/protect-pdf' ? '#ffffff' : 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                padding: '0.45rem 0.75rem',
                borderRadius: '0.5rem',
                background: currentPath === '/protect-pdf' ? 'rgba(77,107,250,0.18)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Protect
            </CustomLink>

            <a
              href="/#faq"
              style={{
                color: 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                padding: '0.45rem 0.75rem',
                borderRadius: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              FAQ
            </a>
          </div>

          {/* Desktop Security Badge */}
          <div className="nav-desktop-badge" style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(77,107,250,0.1)', border: '1px solid rgba(77,107,250,0.25)',
            borderRadius: '2rem', padding: '0.35rem 0.85rem', fontSize: '0.75rem', color: '#7c9aff',
            fontWeight: 600,
          }}>
            <Shield size={13} color="#4ade80" />
            <span>100% Local & Private</span>
          </div>

          {/* Mobile Hamburger Toggle */}
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
          background: 'rgba(10,10,15,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-120%)',
          opacity: mobileMenuOpen ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease',
          overflowY: 'auto',
          display: 'none',
          padding: '1.25rem 1rem 3rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Editor Link */}
          <CustomLink
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: '0.85rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: currentPath === '/' ? '#ffffff' : '#f0f0f0',
              background: currentPath === '/' ? 'rgba(77,107,250,0.2)' : 'rgba(255,255,255,0.04)',
              border: currentPath === '/' ? '1px solid rgba(77,107,250,0.4)' : '1px solid rgba(255,255,255,0.06)',
              textDecoration: 'none',
            }}
          >
            <FileText size={20} color="#4d6bfa" />
            <span>PDF Editor (Text, Draw, Sign)</span>
          </CustomLink>

          {/* Categorized Features */}
          {TOOL_CATEGORIES.map(cat => (
            <div key={cat.title}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#7c9aff', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                {cat.title}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {cat.items.map(tool => {
                  const active = isToolActive(tool.href);
                  return (
                    <CustomLink
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        textDecoration: 'none',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '0.75rem',
                        background: active ? 'rgba(77,107,250,0.18)' : 'rgba(255,255,255,0.03)',
                        border: active ? '1px solid rgba(77,107,250,0.35)' : '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ color: tool.color, flexShrink: 0 }}>
                        {tool.icon}
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: active ? '#7c9aff' : '#f0f0f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tool.name}
                      </span>
                    </CustomLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* FAQ & Security info */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '0.65rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'rgba(240,240,240,0.7)',
                textDecoration: 'none',
              }}
            >
              FAQ & Documentation
            </a>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            background: 'rgba(77,107,250,0.08)', border: '1px solid rgba(77,107,250,0.2)',
            borderRadius: '1rem', padding: '0.75rem 1rem',
            fontSize: '0.8rem', color: '#7c9aff', fontWeight: 600,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
            100% Private · Zero Server Upload
          </div>
        </div>
      </div>
    </>
  );
}
