import React from 'react';
import Hero from '../components/Hero';
import FAQ from '../components/FAQ';
import {
  Type,
  FileSignature,
  Stamp,
  Search,
  ShieldCheck,
  Link as LinkIcon,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  Scissors,
  Minimize2,
  FileDigit,
  EyeOff,
  FileOutput,
  Image as ImageIcon,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { CustomLink } from '../context/RouterContext';
import { SEO_DATA } from '../utils/seo';

interface EditPdfPageProps {
  onFileSelected: (file: File) => void;
}

export default function EditPdfPage({ onFileSelected }: EditPdfPageProps) {
  const seo = SEO_DATA['/edit-pdf'];

  return (
    <div>
      {/* 1. Hero Section */}
      <Hero
        onFileSelected={onFileSelected}
        badgeText={seo.badge}
        h1Title={seo.h1}
        h1Highlight={seo.h1Highlight}
        h1Subtitle={seo.h1Subtitle}
        description="Edit PDF text directly in your browser. Modify existing text, add new text, sign forms, insert stamps, edit hyperlinks, search & replace, and redact sensitive data. 100% free with zero file upload."
      />

      {/* Main Container */}
      <section style={{ padding: '4rem 0 2rem', maxWidth: 1140, margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        
        {/* 2. What Can Be Edited Section */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>
              What You Can <span className="text-gradient">Edit in Your PDF</span>
            </h2>
            <p style={{ color: 'rgba(240,240,240,0.6)', fontSize: '1.05rem', maxWidth: 680, margin: '0 auto', lineHeight: 1.6 }}>
              EditPDF provides a full suite of document editing tools operating directly inside your web browser without sending your document bytes to external cloud servers.
            </p>
          </div>

          {/* 3. Feature Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Edit Existing Text */}
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.85rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(77,107,250,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.15rem' }}>
                <Type size={24} color="#4d6bfa" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.6rem', color: '#f0f0f0' }}>Edit PDF Text</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.65, margin: 0 }}>
                Click existing text lines in your PDF to edit text content, change font family (Helvetica, Times, Courier), adjust font sizes, change text colors, and apply bold or italic formatting.
              </p>
            </div>

            {/* Sign Documents */}
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.85rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(139,92,246,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.15rem' }}>
                <FileSignature size={24} color="#8b5cf6" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.6rem', color: '#f0f0f0' }}>Sign PDF Online</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.65, margin: 0 }}>
                Create digital signatures by drawing with your mouse or touchscreen, typing handwritten-style signatures, or uploading image signatures to complete PDF contracts and forms.
              </p>
            </div>

            {/* Rubber Stamps */}
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.85rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(16,185,129,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.15rem' }}>
                <Stamp size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.6rem', color: '#f0f0f0' }}>Insert Rubber Stamps</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.65, margin: 0 }}>
                Apply standard document status stamps such as Approved, Confidential, Draft, Final, and Received, or place custom image badges onto any PDF page.
              </p>
            </div>

            {/* Search & Replace */}
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.85rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(245,158,11,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.15rem' }}>
                <Search size={24} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.6rem', color: '#f0f0f0' }}>Search & Replace Text</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.65, margin: 0 }}>
                Search for specific words or patterns across all pages of your PDF document and execute instant single or multi-page batch find-and-replace updates.
              </p>
            </div>

            {/* Redaction & Blackout */}
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.85rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(239,68,68,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.15rem' }}>
                <EyeOff size={24} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.6rem', color: '#f0f0f0' }}>Redact Sensitive Data</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.65, margin: 0 }}>
                Blackout sensitive PII, account numbers, and private text. Performs genuine binary text purging so redacted text cannot be highlighted or extracted.
              </p>
            </div>

            {/* PDF Hyperlinks */}
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.85rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(6,182,212,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.15rem' }}>
                <LinkIcon size={24} color="#06b6d4" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.6rem', color: '#f0f0f0' }}>Add & Export Links</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(240,240,240,0.65)', lineHeight: 1.65, margin: 0 }}>
                Attach web links (`http://`, `https://`) or email links (`mailto:`) to any text block. Hyperlinks are embedded as standard interactive PDF URI annotations.
              </p>
            </div>

          </div>
        </div>

        {/* 4. How Editing Works (Workflow) */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.3rem)', fontWeight: 800, margin: '0 0 0.75rem' }}>
              How to Edit a <span className="text-gradient">PDF Online</span>
            </h2>
            <p style={{ color: 'rgba(240,240,240,0.6)', fontSize: '1rem', maxWidth: 600, margin: '0 auto' }}>
              Editing your PDF document takes just a few clicks inside your browser tab:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.6rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(77,107,250,0.35)', marginBottom: '0.5rem' }}>01</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Select Your PDF</h4>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Drag and drop your PDF file or click to select a document from your computer or device.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.6rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(139,92,246,0.35)', marginBottom: '0.5rem' }}>02</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Edit & Modify</h4>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Click text lines to edit existing words, adjust font formatting, insert new text fields, sign, or add stamps.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.6rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(16,185,129,0.35)', marginBottom: '0.5rem' }}>03</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Review & Format</h4>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Check alignment, text styling, page position, and metadata sanitization preferences.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1.25rem', padding: '1.6rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(245,158,11,0.35)', marginBottom: '0.5rem' }}>04</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>Export & Download</h4>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6, margin: 0 }}>
                Click Export PDF to compile and download your updated PDF file instantly without cloud processing delays.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Privacy Explanation & Technical Differentiation */}
        <div className="card-glass" style={{ borderRadius: '1.5rem', padding: '2.5rem 2rem', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f0f0f0' }}>
              Local Browser Processing: How Your Privacy Is Protected
            </h3>
          </div>
          <div style={{ color: 'rgba(240,240,240,0.72)', fontSize: '0.95rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>
              Traditional online PDF editors require you to upload your files to remote cloud servers. Once uploaded, your sensitive documents—such as tax returns, bank statements, legal contracts, or HR records—may be stored in server caches or processed by unknown third parties.
            </p>
            <p>
              <strong>EditPDF works differently:</strong> Your PDF is processed locally in your browser. The editor does not require you to upload the document to a server, ensuring your document data stays on your device during local processing. Using client-side JavaScript, WebAssembly, and local PDF rendering engines, all text modifications, font rasterization, and PDF stream updates occur strictly within your browser sandbox.
            </p>
          </div>
        </div>

        {/* 6. Supported PDF Capabilities & Technical Transparency */}
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#f0f0f0' }}>
            Supported PDF Editing Capabilities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="card-glass" style={{ borderRadius: '1rem', padding: '1.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#4d6bfa', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} /> Vector Text Documents
              </div>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.65)', margin: 0, lineHeight: 1.6 }}>
                Full inline editing, formatting, moving, and deletion of existing text objects in native digital PDFs created from Word, Google Docs, or PDF generators.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1rem', padding: '1.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} /> Scanned PDF Documents
              </div>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.65)', margin: 0, lineHeight: 1.6 }}>
                Supports overlaying new text fields, digital signatures, rubber stamps, watermarks, and blacking out sections via redaction boxes.
              </p>
            </div>

            <div className="card-glass" style={{ borderRadius: '1rem', padding: '1.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} /> Interactive Links & Metadata
              </div>
              <p style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.65)', margin: 0, lineHeight: 1.6 }}>
                Add clickable external links to text elements upon export. Optional metadata sanitization strips author tracking tags upon export.
              </p>
            </div>
          </div>
        </div>

        {/* 7. Internal Linking Architecture to Related PDF Tools */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '3.5rem', marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#f0f0f0' }}>
              Explore Related <span className="text-gradient">PDF Tools</span>
            </h2>
            <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '0.95rem' }}>
              Need to perform page manipulation, conversion, or protection? Try our specialized in-browser utilities:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
            <CustomLink href="/merge-pdf" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Merge PDF files</span>
                <Layers size={18} color="#4d6bfa" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Combine multiple PDF files into a single document locally.</div>
            </CustomLink>

            <CustomLink href="/split-pdf" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Split PDF pages</span>
                <Scissors size={18} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Extract pages or split PDFs by custom page ranges into ZIP archives.</div>
            </CustomLink>

            <CustomLink href="/compress-pdf" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Compress a PDF</span>
                <Minimize2 size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Reduce PDF file size by optimizing stream objects and image DPI.</div>
            </CustomLink>

            <CustomLink href="/watermark-pdf" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Add a watermark</span>
                <Sparkles size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Overlay custom text watermarks with opacity and rotation options.</div>
            </CustomLink>

            <CustomLink href="/protect-pdf" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Protect a PDF</span>
                <Lock size={18} color="#ef4444" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Sanitize metadata tags and set document access privileges.</div>
            </CustomLink>

            <CustomLink href="/redact-pdf-in-browser" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Redact PDF in your browser</span>
                <EyeOff size={18} color="#ec4899" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Perform true binary sanitization for PII and confidential numbers.</div>
            </CustomLink>

            <CustomLink href="/pdf-page-numbers" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Add page numbers</span>
                <FileDigit size={18} color="#06b6d4" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Insert header or footer page numbers with custom page formats.</div>
            </CustomLink>

            <CustomLink href="/flatten-pdf" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Flatten PDF forms</span>
                <FileOutput size={18} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Lock interactive form fields and signatures into non-editable content.</div>
            </CustomLink>

            <CustomLink href="/pdf-to-jpg" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Convert PDF to JPG</span>
                <ImageIcon size={18} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Render PDF pages into high-resolution JPG images up to 300 DPI.</div>
            </CustomLink>

            <CustomLink href="/pdf-to-png" className="card-glass" style={{ padding: '1.35rem', borderRadius: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>Convert PDF to PNG</span>
                <ImageIcon size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.5 }}>Export PDF pages as crisp lossless PNG image files.</div>
            </CustomLink>
          </div>
        </div>

      </section>

      {/* 8. Dedicated FAQ Section */}
      <FAQ
        items={seo.faqs}
        title="Edit PDF Online FAQ"
        subtitle="Answers to common questions about editing PDF text, signing, and document privacy."
      />
    </div>
  );
}
