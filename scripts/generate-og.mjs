import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08080d"/>
      <stop offset="50%" stop-color="#0d0e17"/>
      <stop offset="100%" stop-color="#050508"/>
    </linearGradient>

    <radialGradient id="glow1" cx="20%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#4d6bfa" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#4d6bfa" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="glow2" cx="80%" cy="80%" r="55%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5b7fff"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>

    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <!-- Subtle Grid Pattern -->
  <g opacity="0.05" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="100" x2="1200" y2="100"/>
    <line x1="0" y1="200" x2="1200" y2="200"/>
    <line x1="0" y1="300" x2="1200" y2="300"/>
    <line x1="0" y1="400" x2="1200" y2="400"/>
    <line x1="0" y1="500" x2="1200" y2="500"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- Top Left Logo Badge -->
  <g transform="translate(80, 70)">
    <rect width="48" height="48" rx="14" fill="#4d6bfa"/>
    <path d="M16 12 H26 L34 20 V36 H16 Z" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="20" y1="24" x2="28" y2="24" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    <line x1="20" y1="29" x2="26" y2="29" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    <text x="62" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#f0f0f0" letter-spacing="-0.5">
      Edit<tspan fill="url(#textGrad)">PDF</tspan>
      <tspan font-size="16" fill="rgba(240,240,240,0.5)" font-weight="500" dx="10">by Adwyzors</tspan>
    </text>
  </g>

  <!-- Pill Badge -->
  <g transform="translate(80, 160)">
    <rect width="360" height="36" rx="18" fill="rgba(77,107,250,0.15)" stroke="rgba(77,107,250,0.4)" stroke-width="1"/>
    <circle cx="20" cy="18" r="4" fill="#4ade80"/>
    <text x="32" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#7c9aff" letter-spacing="0.2">
      100% PRIVATE · ZERO SERVER UPLOAD
    </text>
  </g>

  <!-- Main Headline -->
  <g transform="translate(80, 260)">
    <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#f0f0f0" letter-spacing="-1.5">
      Free In-Browser
    </text>
    <text y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="url(#textGrad)" letter-spacing="-1.5">
      PDF Text Editor
    </text>
  </g>

  <!-- Subtitle -->
  <g transform="translate(80, 390)">
    <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="rgba(240,240,240,0.7)" letter-spacing="-0.2">
      Click any text in your PDF to edit it directly in your browser.
    </text>
    <text y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="rgba(240,240,240,0.7)" letter-spacing="-0.2">
      No signup · No file upload · 100% client-side security.
    </text>
  </g>

  <!-- Right Side Visual Card (Glassmorphism PDF Mockup) -->
  <g transform="translate(730, 95)">
    <!-- Card glow -->
    <rect x="-10" y="-10" width="390" height="460" rx="24" fill="rgba(77,107,250,0.15)" filter="blur(20px)"/>
    
    <!-- Card Container -->
    <rect width="370" height="440" rx="20" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
    
    <!-- Header of Mockup -->
    <rect x="0" y="0" width="370" height="46" rx="20" fill="rgba(255,255,255,0.04)"/>
    <circle cx="24" cy="23" r="5" fill="#ef4444" opacity="0.8"/>
    <circle cx="40" cy="23" r="5" fill="#f59e0b" opacity="0.8"/>
    <circle cx="56" cy="23" r="5" fill="#10b981" opacity="0.8"/>
    <text x="185" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="rgba(240,240,240,0.4)" text-anchor="middle">
      confidential_agreement.pdf
    </text>

    <!-- Document Content Lines inside Mockup -->
    <g transform="translate(30, 75)">
      <rect width="180" height="12" rx="4" fill="rgba(240,240,240,0.8)"/>
      <rect y="24" width="300" height="8" rx="3" fill="rgba(240,240,240,0.3)"/>
      <rect y="38" width="280" height="8" rx="3" fill="rgba(240,240,240,0.3)"/>
      <rect y="52" width="250" height="8" rx="3" fill="rgba(240,240,240,0.3)"/>

      <!-- Active Editable Box Highlight -->
      <g transform="translate(0, 80)">
        <rect width="310" height="52" rx="8" fill="rgba(77,107,250,0.18)" stroke="#4d6bfa" stroke-width="1.5"/>
        <text x="14" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#ffffff">
          Purchase Amount: $1,450,000.00
        </text>
        <line x1="250" y1="16" x2="250" y2="34" stroke="#7c9aff" stroke-width="2"/>
        <rect x="14" y="34" width="70" height="6" rx="2" fill="#4d6bfa"/>
      </g>

      <rect y="152" width="290" height="8" rx="3" fill="rgba(240,240,240,0.3)"/>
      <rect y="166" width="305" height="8" rx="3" fill="rgba(240,240,240,0.3)"/>
      <rect y="180" width="230" height="8" rx="3" fill="rgba(240,240,240,0.3)"/>
      <rect y="210" width="140" height="28" rx="8" fill="#4d6bfa"/>
      <text x="70" y="228" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">
        Download PDF ↓
      </text>
    </g>
  </g>

  <!-- Bottom Feature Pills -->
  <g transform="translate(80, 520)">
    <!-- Pill 1 -->
    <rect width="180" height="38" rx="19" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="90" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#f0f0f0" text-anchor="middle">
      🔒 100% In-Browser
    </text>

    <!-- Pill 2 -->
    <g transform="translate(195, 0)">
      <rect width="180" height="38" rx="19" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <text x="90" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#f0f0f0" text-anchor="middle">
        ⚡ Zero Wait / Instant
      </text>
    </g>

    <!-- Pill 3 -->
    <g transform="translate(390, 0)">
      <rect width="190" height="38" rx="19" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <text x="95" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#f0f0f0" text-anchor="middle">
        ✨ No Watermarks / Free
      </text>
    </g>
  </g>
</svg>
`;

async function generate() {
  const outPath = path.resolve('public', 'og-image.jpg');
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toFile(outPath);
  console.log(`Generated OG image at ${outPath}`);
}

generate().catch(console.error);
