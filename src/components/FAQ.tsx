import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SEO_DATA } from '../utils/seo';

interface FAQProps {
  items?: Array<{ q: string; a: string }>;
  title?: string;
  subtitle?: string;
}

export default function FAQ({
  items,
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about 100% private in-browser PDF editing.',
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const defaultFaqs = SEO_DATA['/']?.faqs || [];
  const faqList = items && items.length > 0 ? items : defaultFaqs;

  return (
    <section id="faq" style={{ padding: '5.5rem 0 6rem' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(77,107,250,0.12)', border: '1px solid rgba(77,107,250,0.25)',
            borderRadius: '2rem', padding: '0.35rem 0.9rem', fontSize: '0.8rem', color: '#7c9aff', fontWeight: 600,
            marginBottom: '0.75rem',
          }}>
            <HelpCircle size={13} />
            Instant Answers
          </div>
          <h2 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
            {title.includes('Questions') ? (
              <>
                {title.replace('Questions', '')} <span className="text-gradient">Questions</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '0.98rem', margin: 0, lineHeight: 1.65 }}>
            {subtitle}
          </p>
        </div>

        {/* FAQ items (Always present in raw DOM for search crawlers & Googlebot indexing) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {faqList.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className="card-glass"
                style={{
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, background 0.2s',
                  borderColor: isOpen ? 'rgba(77,107,250,0.4)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    padding: '1.2rem 1.35rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                    color: '#f0f0f0', fontWeight: 600, fontSize: '0.98rem',
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      flexShrink: 0,
                      color: isOpen ? '#4d6bfa' : 'rgba(240,240,240,0.4)',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.25s ease, color 0.2s',
                    }}
                  />
                </button>
                
                {/* Always in DOM for Googlebot — uses max-height:0 instead of display:none */}
                <div
                  id={`faq-answer-${i}`}
                  style={{
                    maxHeight: isOpen ? '600px' : '0',
                    overflow: 'hidden',
                    opacity: isOpen ? 1 : 0,
                    transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease, padding 0.3s ease',
                    padding: isOpen ? '0 1.35rem 1.25rem' : '0 1.35rem 0',
                    color: 'rgba(240,240,240,0.65)',
                    fontSize: '0.9rem',
                    lineHeight: 1.75,
                    borderTop: isOpen ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                    paddingTop: isOpen ? '1rem' : '0',
                  }}
                  aria-hidden={!isOpen}
                >
                  <p style={{ margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
