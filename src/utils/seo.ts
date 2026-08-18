export interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  h1: string;
  h1Highlight: string;
  h1Subtitle: string;
  badge: string;
  schemaType?: string;
  faqs: Array<{ q: string; a: string }>;
}

export const SEO_DATA: Record<string, PageSEO> = {
  '/': {
    title: '100% Private PDF Editor | Edit, Sign, Stamp & Redact PDF Online Free (No Upload)',
    description: 'Free, private online PDF text editor, digital signatures & stamp inserter. 100% in-browser processing, no uploads. Edit text, sign contracts, insert APPROVED / PAID stamps, checkmarks, logos, and download instantly.',
    keywords: '100% private pdf editor, edit pdf online free no upload, stamp documents online free, insert image into pdf, add logo to pdf, stamp approved on pdf, add checkmark to pdf, sign pdf online free, electronic signature pdf, draw signature on pdf, type signature pdf, redact pdf in browser, free pdf editor, client-side pdf editor, edit pdf text online, browser pdf editor, secure pdf editor, edit bank statement pdf, chrome pdf editor',
    canonical: 'https://editpdf.adwyzors.com/',
    ogTitle: '100% Private PDF Editor | Edit, Sign, Stamp & Redact PDF Online Free',
    ogDescription: 'Free, private online PDF editor. 100% in-browser processing, no uploads required. Edit text, sign contracts, insert rubber stamps & logos, and sanitize sensitive data instantly.',
    h1: '100% Private PDF Editor, Signer & Stamper',
    h1Highlight: 'Edit, Sign & Stamp in Browser',
    h1Subtitle: '(Zero Server Upload · 100% Confidential)',
    badge: '100% Private · Digital Signatures · Official Stamps · True Redaction · Zero Server Upload',
    faqs: [
      {
        q: 'Is this PDF editor, digital signature, and document stamper really free?',
        a: 'Yes, it is 100% free to use with no hidden fees, no watermark, no signup required, and no usage limits.'
      },
      {
        q: 'Can I stamp documents with APPROVED, PAID, or custom company logos?',
        a: 'Yes! You can insert official status stamps (APPROVED, PAID, CONFIDENTIAL, VOID, DRAFT, COMPLETED), checkmarks (✓), crossmarks (✗), or upload your company logo and receipts with auto-transparent background removal. Stamps can be scaled, rotated, and positioned anywhere.'
      },
      {
        q: 'Can I sign contracts, NDAs, and forms with a digital signature?',
        a: 'Yes! You can draw a signature with your mouse or stylus, type your name in elegant cursive handwriting fonts, or upload a photo of your signature with automatic background removal. Signatures are saved in your browser for 1-click reuse across multi-page documents.'
      },
      {
        q: 'Does my PDF get uploaded to any server?',
        a: 'No. Unlike other tools, our PDF editor processes your file entirely in your web browser. Your file never leaves your device and is never uploaded to a cloud server, ensuring 100% privacy.'
      },
      {
        q: 'How does the Redaction Verification feature protect sensitive data?',
        a: 'When you redact confidential PII, our Permanent Sanitization engine completely purges underlying text streams. Our automated Redaction Verification scanner then audits the exported PDF binary to confirm zero trace of the redacted text remains.'
      },
      {
        q: 'Will my edits, signatures, and stamps persist across multiple pages?',
        a: 'Yes. Edits, font formatting, additions, redaction boxes, digital signatures, and stamps are saved in an indexed page dictionary and persist seamlessly across all pages during export.'
      },
      {
        q: 'Is this tool compliant with GDPR, HIPAA, and CCPA regulations?',
        a: 'Yes. Because your files never leave your computer or transmit to any external server, using this client-side editor prevents third-party data processing liability under GDPR, HIPAA, and CCPA.'
      }
    ]
  },
  '/secure-pdf-editor': {
    title: 'Secure PDF Editor | 100% Confidential In-Browser PDF Editing',
    description: 'Edit confidential PDFs without uploading files to the cloud. Ideal for legal, medical (HIPAA), HR, and financial documents. 100% private in-browser editor.',
    keywords: 'secure pdf editor, confidential pdf editor, hipaa compliant pdf editor, private document editor, no upload pdf editor, legal pdf editor, client side pdf editing',
    canonical: 'https://editpdf.adwyzors.com/secure-pdf-editor',
    ogTitle: 'Secure PDF Editor - Zero Upload Confidential Editing',
    ogDescription: 'Edit sensitive and confidential PDFs without remote server risks. Guaranteed zero network transfer of document data.',
    h1: 'Confidential & Secure PDF Editor',
    h1Highlight: 'Zero Cloud Storage',
    h1Subtitle: 'Built for Legal, Medical & HR Privacy',
    badge: 'Enterprise-Grade Privacy · HIPAA & GDPR Safe · Client-Side Only',
    faqs: [
      {
        q: 'Why is client-side PDF editing safer for confidential documents?',
        a: 'Cloud-based PDF editors upload your document to third-party cloud servers where it may be cached, logged, analyzed by AI models, or exposed to data breaches. Our client-side editor executes entirely inside your browser sandbox, eliminating external data exposure.'
      },
      {
        q: 'Can lawyers, doctors, and HR professionals safely use this tool?',
        a: 'Yes. Since zero data is transmitted over the internet, no Business Associate Agreement (BAA) or data processing agreement is breached. Documents containing Protected Health Information (PHI), client privilege, or employee PII stay strictly on your local machine.'
      },
      {
        q: 'Does this editor work offline or in air-gapped environments?',
        a: 'Yes! Once the webpage assets are loaded into your browser, you can disconnect your internet or work offline. All PDF parsing, rendering, text editing, and PDF regeneration happen locally.'
      },
      {
        q: 'Are any tracking pixels or document telemetry collected?',
        a: 'No. We do not inspect, log, or track document contents, filenames, or edited text strings. Your document privacy is mathematically guaranteed by the architecture.'
      }
    ]
  },
  '/edit-bank-statement-pdf': {
    title: 'Edit Bank Statement PDF | Modify Financial Documents Privately',
    description: 'Edit bank statements, pay stubs, tax returns, and financial PDFs online without uploading sensitive account numbers to remote servers. 100% private & instant.',
    keywords: 'edit bank statement pdf, edit financial pdf, modify bank statement text, private bank statement editor, edit pdf numbers no upload, tax form pdf editor',
    canonical: 'https://editpdf.adwyzors.com/edit-bank-statement-pdf',
    ogTitle: 'Edit Bank Statement PDF Privately - No Server Upload',
    ogDescription: 'Safely edit financial statements and PDF documents directly in your browser without exposing your bank account details or financial data.',
    h1: 'Edit Bank Statement & Financial PDFs',
    h1Highlight: '100% Privately',
    h1Subtitle: 'Never Upload Bank Numbers to Cloud Servers',
    badge: 'Financial Privacy · Bank-Grade Protection · Zero Server Logging',
    faqs: [
      {
        q: 'Is it safe to edit bank statements and financial PDFs with this tool?',
        a: 'Yes, because our editor runs 100% inside your browser. Your account numbers, routing numbers, balance figures, and transaction logs are never uploaded to any remote server or cloud database.'
      },
      {
        q: 'Can I edit numbers, transaction descriptions, and dates on financial PDFs?',
        a: 'Yes. Simply upload your PDF statement, click on any text or numeric field you wish to adjust, type the updated values, adjust formatting or colors if needed, and export the updated PDF.'
      },
      {
        q: 'Why should I avoid uploading bank statements to conventional PDF tools?',
        a: 'Conventional cloud PDF converters store files on centralized servers during processing. If those servers suffer a breach, or if their data retention policies retain files for days, your financial records become vulnerable to identity theft.'
      },
      {
        q: 'Will financial table layouts and alignment stay intact?',
        a: 'Yes. Our editor updates individual text nodes in place without reflowing or disrupting surrounding gridlines, logos, or table borders.'
      }
    ]
  },
  '/redact-pdf-in-browser': {
    title: 'Redact PDF in Browser | Permanent In-Browser Text Sanitization',
    description: 'Permanently redact sensitive text, SSNs, credit card numbers, and confidential PII from PDF documents in your browser. Stream-purged sanitization with 100% client-side privacy.',
    keywords: 'redact pdf in browser, blackout pdf text, remove pii from pdf, redact pdf free no upload, sanitize pdf document, permanent pdf redaction, erase text from pdf online',
    canonical: 'https://editpdf.adwyzors.com/redact-pdf-in-browser',
    ogTitle: 'Redact PDF in Browser - Permanent In-Browser Sanitization',
    ogDescription: 'Safely blackout or remove confidential text and numbers from PDF files without cloud uploads.',
    h1: 'Redact & Sanitize PDF in Browser',
    h1Highlight: 'Zero Cloud Exposure',
    h1Subtitle: 'Remove Sensitive PII & Confidential Data Locally',
    badge: 'Permanent Stream Sanitization · 100% In-Browser · Unrecoverable',
    faqs: [
      {
        q: 'How is this redaction different from drawing a black box in a previewer?',
        a: 'Drawing a simple black box in standard PDF previewers leaves the underlying text stream intact in the PDF code, allowing anyone to copy or extract the hidden data. Our Permanent Sanitization mode renders pages at 300 DPI and flattens the visual layer, completely destroying underlying text streams, OCR layers, and hidden vector objects from the PDF binary.'
      },
      {
        q: 'Can I remove Social Security Numbers (SSN) and credit card data safely?',
        a: 'Yes. You can draw blackout boxes or delete sensitive identifying numbers, then export via Permanent Sanitization mode to ensure the sensitive bytes are purged before sharing the PDF.'
      },
      {
        q: 'Are deleted or blacked-out text items recoverable from the exported PDF?',
        a: 'No. When exported in Permanent Sanitization mode, the underlying text stream is physically purged from the PDF file. No text extraction tool, CLI utility, or PDF editor can recover the original text because those bytes do not exist in the output file.'
      }
    ]
  },
  '/chrome-pdf-editor': {
    title: 'Chrome PDF Editor | Edit PDFs in Google Chrome (No Extension Needed)',
    description: 'Fast, native PDF text editor for Google Chrome, Chromium, Edge & Brave. No extension or plugin download required. Edit text in PDFs directly in your browser tab.',
    keywords: 'chrome pdf editor, edit pdf in google chrome, browser pdf editor, pdf editor no extension, chrome web pdf editor, edge pdf editor, brave browser pdf editor',
    canonical: 'https://editpdf.adwyzors.com/chrome-pdf-editor',
    ogTitle: 'Google Chrome PDF Editor - Edit PDFs In-Tab With Zero Extensions',
    ogDescription: 'Edit text in PDF documents inside Google Chrome and Chromium browsers. Ultra-fast WebAssembly engine, zero extension install required.',
    h1: 'Google Chrome PDF Text Editor',
    h1Highlight: 'In-Tab & Extension-Free',
    h1Subtitle: 'High-Performance WebAssembly PDF Editing in Your Browser',
    badge: 'Chrome & Chromium Optimized · No Extension Install · Instant V8 Speed',
    faqs: [
      {
        q: 'Do I need to install a Google Chrome extension or software?',
        a: 'No! EditPDF runs directly in your Chrome, Edge, or Brave tab via standard HTML5 Canvas and modern WebAssembly. No extension permissions or desktop downloads are required.'
      },
      {
        q: 'Does it work smoothly on Chromebooks and lightweight laptops?',
        a: 'Yes. Because our JavaScript and WebAssembly engine is lightweight and optimized for modern V8 engines, it runs smoothly on Chromebooks, MacBooks, and Windows PCs alike.'
      },
      {
        q: 'Can I use keyboard shortcuts and zoom controls in Chrome?',
        a: 'Yes. You get full zoom in/out controls, multi-page previews, undo/redo history, and intuitive point-and-click editing.'
      }
    ]
  },
  '/privacy-policy': {
    title: 'Privacy Policy | EditPDF by Adwyzors - 100% Private In-Browser PDF Editor',
    description: 'Read the privacy policy of EditPDF. We collect zero document data, perform zero server uploads, and store no personal information.',
    keywords: 'editpdf privacy policy, private pdf editor privacy, client side pdf privacy, zero data collection pdf editor',
    canonical: 'https://editpdf.adwyzors.com/privacy-policy',
    ogTitle: 'Privacy Policy - EditPDF (100% Client-Side Privacy)',
    ogDescription: 'Zero server uploads, zero document logging. Read how EditPDF guarantees document confidentiality.',
    h1: 'Privacy Policy',
    h1Highlight: 'Zero Data Collection',
    h1Subtitle: '100% Client-Side In-Browser Processing',
    badge: 'Privacy Policy · Effective Aug 2026',
    faqs: []
  },
  '/about': {
    title: 'About Us | EditPDF by Adwyzors - Free & Private PDF Tool',
    description: 'Learn about EditPDF and Adwyzors. Our mission is to provide private, fast, in-browser document editing tools with zero tracking.',
    keywords: 'about editpdf, about adwyzors, private pdf tools mission, client-side tools creator',
    canonical: 'https://editpdf.adwyzors.com/about',
    ogTitle: 'About EditPDF - Private Document Editing by Adwyzors',
    ogDescription: 'We believe document editing should be private by default. Learn about EditPDF.',
    h1: 'About EditPDF',
    h1Highlight: 'Private by Default',
    h1Subtitle: 'Built by Adwyzors Software Studio',
    badge: 'About Adwyzors · Privacy Mission',
    faqs: []
  },
  '/terms': {
    title: 'Terms of Service | EditPDF by Adwyzors',
    description: 'Terms of Service for EditPDF by Adwyzors. Rules, disclaimers, and terms governing the use of our free in-browser PDF editor.',
    keywords: 'editpdf terms of service, pdf editor terms, terms and conditions editpdf',
    canonical: 'https://editpdf.adwyzors.com/terms',
    ogTitle: 'Terms of Service - EditPDF by Adwyzors',
    ogDescription: 'Read the Terms of Service governing the use of EditPDF.',
    h1: 'Terms of Service',
    h1Highlight: 'Legal & Guidelines',
    h1Subtitle: 'Rules and Responsibilities for Using EditPDF',
    badge: 'Terms of Service · Effective Aug 2026',
    faqs: []
  }
};

export function updateMetaForPath(path: string) {
  if (typeof document === 'undefined') return;
  const normalizedPath = path === '' || path === '/' ? '/' : path.replace(/\/$/, '');
  const data = SEO_DATA[normalizedPath] || SEO_DATA['/'];

  // Update Title
  document.title = data.title;

  // Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', data.description);

  // Update Meta Keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', data.keywords);

  // Update Canonical
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', data.canonical);

  // Update OpenGraph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', data.ogTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', data.ogDescription);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', data.canonical);

  // Update dynamic FAQPage JSON-LD Schema
  let dynamicFaqSchema = document.getElementById('dynamic-faq-schema') as HTMLScriptElement | null;
  if (!dynamicFaqSchema) {
    dynamicFaqSchema = document.createElement('script');
    dynamicFaqSchema.id = 'dynamic-faq-schema';
    dynamicFaqSchema.type = 'application/ld+json';
    document.head.appendChild(dynamicFaqSchema);
  }

  const faqSchemaObj = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  };

  dynamicFaqSchema.text = JSON.stringify(faqSchemaObj, null, 2);
}
