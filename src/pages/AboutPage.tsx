import { Users, Zap, Heart, Globe, Shield, ArrowRight } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';

export default function AboutPage() {
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
            <Users size={13} />
            About Adwyzors
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
            About <span className="text-gradient">EditPDF</span>
          </h1>
          <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '0.98rem', lineHeight: 1.65, maxWidth: 600, margin: '0 auto' }}>
            We believe document editing should be private by default — not by request.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(77,107,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={20} color="#4d6bfa" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Our Mission</h2>
          </div>
          <p style={{ color: 'rgba(240,240,240,0.7)', fontSize: '0.92rem', lineHeight: 1.8, margin: 0 }}>
            EditPDF was built with one conviction: <strong>your documents should never have to leave your device just to make a simple text edit.</strong> Every major PDF editor on the market uploads your files to cloud servers during processing — exposing sensitive contracts, medical records, financial statements, and personal data to third-party infrastructure. We built the alternative: a high-performance, entirely client-side PDF editor that runs 100% inside your web browser, with zero server uploads and zero data collection.
          </p>
        </div>

        {/* Values Grid */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1.5rem', textAlign: 'center' }}>What We Stand For</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(77,107,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Shield size={22} color="#4d6bfa" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Privacy First</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.65, margin: 0 }}>
                Your files never leave your device. No uploads, no cloud storage, no tracking. We don't even have the infrastructure to receive your documents.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Zap size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Free Forever</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.65, margin: 0 }}>
                No subscriptions, no watermarks, no hidden fees. EditPDF is completely free to use with no limits on document editing.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Globe size={22} color="#8b5cf6" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Open & Transparent</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.65, margin: 0 }}>
                Verify our privacy claims yourself: open Developer Tools → Network tab while editing. You'll see zero document data leaves your browser.
              </p>
            </div>
          </div>
        </div>

        {/* About Adwyzors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>About Adwyzors</h2>
            <p style={{ color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8, margin: 0 }}>
              Adwyzors is a software studio focused on building practical, privacy-respecting web tools. EditPDF is our flagship document editing tool, and we also operate{' '}
              <a href="https://qrgen.adwyzors.com" target="_blank" rel="noopener noreferrer" style={{ color: '#7c9aff', textDecoration: 'none' }}>QRGen</a> (a free QR code generator) and other utility applications. We're based on the principle that the best software serves users without exploiting their data.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Technology</h2>
            <p style={{ color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8, margin: 0 }}>
              EditPDF is built with React, TypeScript, and modern WebAssembly-powered PDF libraries (PDF.js for rendering, pdf-lib for modification). The entire application runs in your browser's sandboxed JavaScript runtime — there is no backend server processing documents.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Contact Us</h2>
            <p style={{ color: 'rgba(240,240,240,0.65)', fontSize: '0.9rem', lineHeight: 1.8, margin: 0 }}>
              Have questions, feedback, or feature requests? Reach out to us at{' '}
              <a href="mailto:contact@adwyzors.com" style={{ color: '#7c9aff', textDecoration: 'none' }}>contact@adwyzors.com</a>.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Ready to Edit PDFs Privately?</h3>
          <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '0.9rem', margin: '0 0 1.25rem', lineHeight: 1.65 }}>
            No signup needed. Drop your PDF and start editing in seconds.
          </p>
          <CustomLink
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: '#4d6bfa', color: '#fff', fontWeight: 600,
              padding: '0.7rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.9rem',
              textDecoration: 'none', transition: 'background 0.2s, transform 0.15s',
            }}
          >
            Open PDF Editor <ArrowRight size={16} />
          </CustomLink>
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
