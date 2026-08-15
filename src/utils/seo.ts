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
    title: 'Private PDF Editor (No Upload) | Edit PDFs Online Free & Secure',
    description: 'Edit PDF text online for free with 100% in-browser processing. Zero server uploads, completely private & secure. Click any text to modify and download instantly.',
    keywords: 'private pdf editor, edit pdf no upload, client-side pdf editor, edit pdf text online, free browser pdf editor, secure pdf editor, pdf text changer, offline pdf editor',
    canonical: 'https://editpdf.adwyzors.com/',
    ogTitle: '100% Private PDF Text Editor | Edit in Browser (No Server Upload)',
    ogDescription: 'Edit PDF text directly in your browser without uploading files to any cloud server. Fast, free, and completely private.',
    h1: '100% Private PDF Text Editor',
    h1Highlight: 'Edit in Browser',
    h1Subtitle: '(No Server Upload)',
    badge: '100% Private · Zero Server Upload · No Signup Required',
    faqs: [
      {
        q: 'Is this PDF text editor really free?',
        a: 'Yes, EditPDF by Adwyzors is 100% free forever. There are no subscriptions, no paywalls, no watermarks, and no sign-up required.'
      },
      {
        q: 'Does my PDF ever get uploaded to any server or cloud?',
        a: 'No. Your PDF is processed 100% locally on your device inside your browser using WebAssembly and client-side JavaScript. Not a single byte of your document is ever transmitted over the network.'
      },
      {
        q: 'What types of PDFs can I edit?',
        a: 'You can edit any native, text-based PDF—including contracts, invoices, resumes, bank statements, reports, and tax documents. Scanned image-only PDFs require OCR before text can be edited directly.'
      },
      {
        q: 'Will the edited text match the original PDF fonts?',
        a: 'When you edit text, the editor matches the font family (Helvetica/Sans-Serif, Times-Roman/Serif, or Courier/Monospace), font size, styling (bold, italic, underline), and text color with precision.'
      },
      {
        q: 'Can I edit multi-page PDF documents?',
        a: 'Yes! You can seamlessly navigate through all pages of multi-page PDF documents, making targeted edits across any page before exporting the final PDF.'
      },
      {
        q: 'What happens if I close the browser without downloading?',
        a: 'Because no files or changes are stored on remote servers, your edits exist only in your browser tab’s temporary memory. Be sure to click "Download PDF" to save your changes to your device.'
      },
      {
        q: 'Is this tool compliant with GDPR, HIPAA, and CCPA regulations?',
        a: 'Yes. Because your files never leave your computer or transmit to any external server, using this client-side editor prevents third-party data processing liability under GDPR, HIPAA, and CCPA.'
      },
      {
        q: 'How does EditPDF compare to Adobe Acrobat or Smallpdf?',
        a: 'Unlike Adobe Acrobat (which requires expensive monthly subscriptions) or Smallpdf/iLovePDF (which upload your sensitive documents to remote cloud servers), EditPDF is free, instantaneous, and strictly client-side.'
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
    title: 'Redact PDF in Browser | Remove & Blackout Text Without Uploading',
    description: 'Permanently redact sensitive text, SSNs, credit card numbers, and confidential PII from PDF documents directly in your browser. 100% client-side security.',
    keywords: 'redact pdf in browser, blackout pdf text, remove pii from pdf, redact pdf free no upload, sanitize pdf document, erase text from pdf online',
    canonical: 'https://editpdf.adwyzors.com/redact-pdf-in-browser',
    ogTitle: 'Redact PDF in Browser - Private Text Removal & Sanitization',
    ogDescription: 'Safely blackout or remove confidential text and numbers from PDF files without cloud uploads.',
    h1: 'Redact & Sanitize PDF in Browser',
    h1Highlight: 'Zero Cloud Exposure',
    h1Subtitle: 'Remove Sensitive PII & Confidential Data Locally',
    badge: 'True Vector Redaction · No Cloud Footprint · Free & Instant',
    faqs: [
      {
        q: 'How is this redaction different from drawing a black box in a previewer?',
        a: 'Drawing a simple black box in basic viewers often leaves the underlying text stream intact in the PDF code (which can be copied or selected). Our client-side editor replaces the underlying text stream and covers the region, preventing extraction.'
      },
      {
        q: 'Can I remove Social Security Numbers (SSN) and credit card data safely?',
        a: 'Yes. You can delete or replace sensitive identifying numbers directly on your device before sharing the PDF with third parties.'
      },
      {
        q: 'Are deleted text items recoverable from the exported PDF?',
        a: 'No. When you delete or modify an item and click Download, the export engine white-outs the original vector region and removes the text from the new document’s text stream.'
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
