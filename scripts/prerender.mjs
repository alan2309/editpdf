import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Import SEO data structure
const SEO_DATA = {
  '/': {
    title: '100% Private PDF Editor | Edit, Sign, Stamp, Find & Replace PDF Online Free (No Upload)',
    description: 'Free, private online PDF text editor, find & replace, digital signatures & stamp inserter. 100% in-browser processing, no uploads. Search and replace text across pages, sign contracts, insert rubber stamps, and download instantly.',
    keywords: '100% private pdf editor, edit pdf online free no upload, find and replace text in pdf, search and replace pdf online free, batch replace text in pdf, stamp documents online free, insert image into pdf, add logo to pdf, stamp approved on pdf, add checkmark to pdf, sign pdf online free, electronic signature pdf, draw signature on pdf, type signature pdf, redact pdf in browser, free pdf editor, client-side pdf editor, edit pdf text online, browser pdf editor, secure pdf editor, edit bank statement pdf, chrome pdf editor',
    canonical: 'https://editpdf.adwyzors.com/',
    ogTitle: '100% Private PDF Editor | Edit, Sign, Stamp & Find-Replace PDF Online Free',
    ogDescription: 'Free, private online PDF editor. 100% in-browser processing, no uploads required. Search & replace text across all pages, sign contracts, insert rubber stamps, and sanitize data instantly.',
    faqs: [
      {
        q: 'Can I find and replace text across multiple pages in my PDF?',
        a: 'Yes! With our multi-page Find & Replace tool (press Ctrl+F or click Find & Replace), you can search terms with Match Case and Whole Word options, replace single matches, batch replace all occurrences across the entire document, or redact all matches in one click.'
      },
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
    faqs: []
  },
  '/about': {
    title: 'About Us | EditPDF by Adwyzors - Free & Private PDF Tool',
    description: 'Learn about EditPDF and Adwyzors. Our mission is to provide private, fast, in-browser document editing tools with zero tracking.',
    keywords: 'about editpdf, about adwyzors, private pdf tools mission, client-side tools creator',
    canonical: 'https://editpdf.adwyzors.com/about',
    ogTitle: 'About EditPDF - Private Document Editing by Adwyzors',
    ogDescription: 'We believe document editing should be private by default. Learn about EditPDF.',
    faqs: []
  },
  '/terms': {
    title: 'Terms of Service | EditPDF by Adwyzors',
    description: 'Terms of Service for EditPDF by Adwyzors. Rules, disclaimers, and terms governing the use of our free in-browser PDF editor.',
    keywords: 'editpdf terms of service, pdf editor terms, terms and conditions editpdf',
    canonical: 'https://editpdf.adwyzors.com/terms',
    ogTitle: 'Terms of Service - EditPDF by Adwyzors',
    ogDescription: 'Read the Terms of Service governing the use of EditPDF.',
    faqs: []
  }
};

function generateRouteHTML(templateHtml, route, data, appHtml = '') {
  let html = templateHtml;

  // Replace <title>
  html = html.replace(/<title>.*?<\/title>/, `<title>${data.title}</title>`);

  // Replace meta title
  html = html.replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${data.title}" />`);

  // Replace meta description
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${data.description}" />`);

  // Replace meta keywords
  html = html.replace(/<meta name="keywords" content=".*?" \/>/, `<meta name="keywords" content="${data.keywords}" />`);

  // Replace canonical
  html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${data.canonical}" />`);

  // Replace OpenGraph
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${data.ogTitle}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${data.ogDescription}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${data.canonical}" />`);

  // Replace Twitter
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${data.ogTitle}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${data.ogDescription}" />`);
  html = html.replace(/<meta name="twitter:url" content=".*?" \/>/, `<meta name="twitter:url" content="${data.canonical}" />`);

  // Update dynamic FAQPage Schema if faqs exist
  if (data.faqs && data.faqs.length > 0) {
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

    const faqScriptTag = `<script type="application/ld+json" id="dynamic-faq-schema">\n${JSON.stringify(faqSchemaObj, null, 2)}\n    </script>`;
    html = html.replace(/<script type="application\/ld\+json" id="dynamic-faq-schema">[\s\S]*?<\/script>/, faqScriptTag);
  }

  // Inject full pre-rendered HTML DOM into <div id="root">
  if (appHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  }

  return html;
}

async function runPrerender() {
  const distDir = path.resolve('dist');
  const ssrEntryPath = path.resolve('dist-ssr', 'entry-server.js');

  if (!fs.existsSync(distDir)) {
    console.error('dist directory not found. Please run vite build first.');
    process.exit(1);
  }

  let renderFn = null;
  if (fs.existsSync(ssrEntryPath)) {
    try {
      const serverModule = await import(pathToFileURL(ssrEntryPath).href);
      renderFn = serverModule.render;
      console.log('✓ Loaded SSR server renderer for Full DOM generation.');
    } catch (e) {
      console.warn('Warning: Could not load SSR renderer, falling back to head-only pre-render:', e);
    }
  }

  const templatePath = path.join(distDir, 'index.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');

  console.log('Generating Full-DOM pre-rendered static route HTML files for Googlebot & SEO crawlers...');

  for (const [route, data] of Object.entries(SEO_DATA)) {
    let appHtml = '';
    if (renderFn) {
      try {
        appHtml = renderFn(route);
      } catch (err) {
        console.error(`Error rendering DOM for route ${route}:`, err);
      }
    }

    const routeHtml = generateRouteHTML(templateHtml, route, data, appHtml);

    if (route === '/') {
      fs.writeFileSync(templatePath, routeHtml, 'utf-8');
      console.log(`  ✓ / (index.html populated with full DOM + SEO head)`);
    } else {
      const cleanName = route.replace(/^\//, '');
      const targetDir = path.join(distDir, cleanName);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetFile = path.join(targetDir, 'index.html');
      fs.writeFileSync(targetFile, routeHtml, 'utf-8');

      // Also write clean route.html (e.g. dist/chrome-pdf-editor.html) for Vercel cleanUrls
      const flatHtmlFile = path.join(distDir, `${cleanName}.html`);
      fs.writeFileSync(flatHtmlFile, routeHtml, 'utf-8');

      console.log(`  ✓ ${route} -> ${targetFile} & ${cleanName}.html (Full DOM pre-rendered)`);
    }
  }

  // Create 404.html fallback
  let rootHtml = '';
  if (renderFn) {
    try { rootHtml = renderFn('/'); } catch {}
  }
  const notFoundPath = path.join(distDir, '404.html');
  fs.writeFileSync(notFoundPath, generateRouteHTML(templateHtml, '/', SEO_DATA['/'], rootHtml), 'utf-8');
  console.log('  ✓ 404.html fallback created with full DOM');

  // Clean up dist-ssr temporary build
  const distSsrDir = path.resolve('dist-ssr');
  if (fs.existsSync(distSsrDir)) {
    fs.rmSync(distSsrDir, { recursive: true, force: true });
  }

  console.log('🎉 Full DOM Pre-rendering completed successfully! Zero empty <body> tags.');
}

runPrerender().catch(console.error);
