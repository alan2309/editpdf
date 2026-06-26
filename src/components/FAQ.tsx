import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Is this PDF text editor really free?',
    a: 'Yes — EditPDF is 100% free forever. No subscriptions, no watermarks, no hidden fees, and no signup required.',
  },
  {
    q: 'Does my PDF get uploaded to any server?',
    a: 'Absolutely not. Your PDF is processed entirely inside your browser using JavaScript. The file never leaves your device and is never sent to any server — making it completely private and secure.',
  },
  {
    q: 'What types of PDFs can I edit?',
    a: 'You can edit any text-based PDF — documents, reports, forms, resumes, contracts, and more. Scanned PDFs (image-only) cannot be edited as they contain no machine-readable text.',
  },
  {
    q: 'Will the fonts look exactly the same after editing?',
    a: 'Edited text uses standard fonts (Helvetica for sans-serif, Times-Roman for serif, Courier for mono). The font may differ slightly from the original PDF\'s embedded font — this is a standard limitation of all client-side PDF editors.',
  },
  {
    q: 'Can I edit multiple pages?',
    a: 'Yes! Use the page navigation arrows in the toolbar to move between pages and edit text on any page of your document.',
  },
  {
    q: 'What happens if I close the browser without downloading?',
    a: 'Your edits exist only in your browser\'s memory. If you close the tab without downloading, the edits will be lost. Always download your PDF before closing.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes, the interface is fully responsive. However, for precise text selection on complex PDFs, a desktop or laptop provides the best experience.',
  },
  {
    q: 'How is this different from Adobe Acrobat?',
    a: 'Adobe Acrobat is a premium product requiring a subscription for editing. EditPDF is free, requires no installation, and is 100% private — your files never leave your device. It\'s perfect for quick edits without any overhead.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" style={{ padding: '5rem 0 6rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p style={{ color: 'rgba(240,240,240,0.5)', fontSize: '1rem', margin: 0, lineHeight: 1.65 }}>
            Everything you need to know about editing PDFs in your browser.
          </p>
        </div>

        {/* FAQ items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="card-glass"
                style={{
                  borderRadius: '0.875rem',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  borderColor: isOpen ? 'rgba(77,107,250,0.35)' : 'rgba(255,255,255,0.10)',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    padding: '1.125rem 1.25rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                    color: '#f0f0f0', fontWeight: 600, fontSize: '0.9375rem',
                  }}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      flexShrink: 0,
                      color: 'rgba(240,240,240,0.4)',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 1.25rem 1.125rem',
                    color: 'rgba(240,240,240,0.6)',
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    paddingTop: '1rem',
                    marginTop: 0,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
