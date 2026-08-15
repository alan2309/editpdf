import React from 'react';
import Hero from '../components/Hero';
import FAQ from '../components/FAQ';
import { ShieldCheck, Lock, FileCheck2, Scale, AlertTriangle, ArrowRight, UserCheck, Stethoscope, Briefcase } from 'lucide-react';
import { CustomLink } from '../context/RouterContext';
import { SEO_DATA } from '../utils/seo';

interface SpokeProps {
  onFileSelected: (file: File) => void;
}

export default function SecurePdfEditorPage({ onFileSelected }: SpokeProps) {
  const seo = SEO_DATA['/secure-pdf-editor'];

  return (
    <div>
      {/* Targeted Hero */}
      <Hero
        onFileSelected={onFileSelected}
        badgeText={seo.badge}
        h1Title={seo.h1}
        h1Highlight={seo.h1Highlight}
        h1Subtitle={seo.h1Subtitle}
        description="Edit legal contracts, medical charts, and HR documents directly inside your browser. Zero server upload guarantees complete immunity from cloud breaches, third-party snooping, and compliance liabilities."
      />

      {/* Spoke Deep Content Section */}
      <section style={{ padding: '4rem 0 2rem', maxWidth: 1040, margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        
        {/* Industry Trust Grid */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.75rem' }}>
              Engineered for <span className="text-gradient">High-Confidentiality</span> Professions
            </h2>
            <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '1rem', maxWidth: 640, margin: '0 auto' }}>
              Why lawyers, clinicians, and HR managers cannot risk conventional cloud PDF services.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(77,107,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Scale size={22} color="#4d6bfa" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Legal & Litigation</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.65, margin: 0 }}>
                Protect attorney-client privilege. Modify agreements, settlements, and non-disclosure agreements (NDAs) without transmitting trade secrets to third-party servers.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Stethoscope size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Healthcare & HIPAA</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.65, margin: 0 }}>
                Maintain strict HIPAA compliance. Edit patient intake sheets, medical release forms, and lab reports locally without requiring Business Associate Agreements.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Briefcase size={22} color="#8b5cf6" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>HR & Enterprise Talent</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.65, margin: 0 }}>
                Safeguard employee Social Security Numbers, background checks, compensation letters, and performance evaluations from corporate data harvesting.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Compliance Deep Dive */}
        <div className="card-glass" style={{ borderRadius: '1.5rem', padding: '2.5rem 2rem', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
              The Zero-Upload Security Architecture
            </h3>
          </div>

          <div style={{ color: 'rgba(240,240,240,0.7)', fontSize: '0.92rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              Under standard enterprise data protection protocols, any tool that transfers documents over an external network introduces security surface area. 
              Traditional cloud editors store temporary copies of files in Amazon S3 buckets or Google Cloud Storage disks during text extraction. 
              If those endpoints are misconfigured or targeted by zero-day vulnerabilities, your data is exposed.
            </p>
            <p>
              With <strong>EditPDF Secure In-Browser Processing</strong>:
            </p>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Zero Cloud Transport:</strong> The PDF binary is ingested via HTML5 File Reader into the browser’s sandboxed V8 runtime.</li>
              <li><strong>Air-Gappable:</strong> You can load this page, disconnect your Wi-Fi, and perform all text edits completely offline.</li>
              <li><strong>Zero Document Telemetry:</strong> No text queries, document metrics, or user contents are logged or stored.</li>
            </ul>
          </div>
        </div>

        {/* Internal Cross-Linking Section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '3rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#f0f0f0' }}>Related PDF Privacy Tools</h4>
              <p style={{ color: 'rgba(240,240,240,0.5)', fontSize: '0.85rem', margin: 0 }}>Explore specialized zero-upload document utilities</p>
            </div>
            <CustomLink href="/" style={{ color: '#4d6bfa', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
              Back to Main Hub <ArrowRight size={14} />
            </CustomLink>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <CustomLink href="/edit-bank-statement-pdf" className="card-glass" style={{ padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Edit Bank Statement PDF</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.5)' }}>Safely modify financial statements without cloud logs.</div>
            </CustomLink>
            <CustomLink href="/redact-pdf-in-browser" className="card-glass" style={{ padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Redact PDF in Browser</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.5)' }}>Blackout and erase confidential text locally.</div>
            </CustomLink>
            <CustomLink href="/chrome-pdf-editor" className="card-glass" style={{ padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Chrome PDF Editor</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.5)' }}>Extension-free, high speed in-browser editing.</div>
            </CustomLink>
          </div>
        </div>

      </section>

      {/* Specialized FAQ for this Spoke */}
      <FAQ
        items={seo.faqs}
        title="Secure PDF Editing FAQ"
        subtitle="Common questions about document privacy, compliance, and zero-upload processing."
      />
    </div>
  );
}
