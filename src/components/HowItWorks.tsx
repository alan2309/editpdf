import { Upload, MousePointer2, Download, Lock } from 'lucide-react';

const steps = [
  {
    icon: <Upload size={24} color="#4d6bfa" />,
    num: '01',
    title: 'Upload Your PDF',
    desc: 'Drag & drop or click to select any text-based PDF from your device. Nothing is uploaded to any server.',
  },
  {
    icon: <MousePointer2 size={24} color="#8b5cf6" />,
    num: '02',
    title: 'Click Text to Edit',
    desc: 'Hover over any text in the PDF and click it to activate an editable field. Type your changes directly.',
  },
  {
    icon: <Download size={24} color="#4d6bfa" />,
    num: '03',
    title: 'Download Modified PDF',
    desc: 'Hit the Download button to save your edited PDF. All processing happens in your browser — 100% private.',
  },
  {
    icon: <Lock size={24} color="#8b5cf6" />,
    num: '04',
    title: 'Your Data Stays Local',
    desc: 'No account, no cloud, no tracking. Your PDF never leaves your device. Close the tab and everything is gone.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
      {/* BG accent */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(77,107,250,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
            How It <span className="text-gradient">Works</span>
          </h2>
          <p style={{ color: 'rgba(240,240,240,0.5)', fontSize: '1rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            Edit your PDF in four simple steps — no software to install, no account to create.
          </p>
        </div>

        {/* Steps grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="card-glass animate-fade-in-up"
              style={{
                borderRadius: '1.25rem',
                padding: '2rem 1.5rem',
                position: 'relative',
                opacity: 0,
                animationDelay: `${i * 0.1 + 0.2}s`,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {/* Step number */}
              <span style={{
                position: 'absolute', top: '1rem', right: '1rem',
                fontSize: '2rem', fontWeight: 900,
                color: 'rgba(255,255,255,0.04)',
                letterSpacing: '-0.05em',
              }}>{step.num}</span>

              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: '0.875rem',
                background: i % 2 === 0 ? 'rgba(77,107,250,0.12)' : 'rgba(139,92,246,0.12)',
                border: `1px solid ${i % 2 === 0 ? 'rgba(77,107,250,0.25)' : 'rgba(139,92,246,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                {step.icon}
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f0f0f0' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.5)', margin: 0, lineHeight: 1.65 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
