import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Provide browser global polyfills for Node.js SSR renderer
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}
if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D {};
}
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {};
}

// Import SEO data structure
const SEO_DATA = {
  '/': {
    title: '100% Private PDF Editor & Toolbox | Edit, Merge, Split, Compress & Convert PDF (No Upload)',
    description: 'Free, private online PDF editor and complete PDF toolbox. Merge, split, compress, convert, watermark, and edit text 100% client-side. Zero file upload.',
    keywords: '100% private pdf editor, edit pdf online free no upload, merge pdf online free, split pdf, compress pdf, convert pdf to jpg, pdf toolbox, pdf to png, jpg to pdf, watermark pdf, flatten pdf, chrome pdf editor',
    canonical: 'https://editpdf.adwyzors.com/',
    ogTitle: '100% Private PDF Editor & Toolbox | Edit, Merge, Split & Convert Online Free',
    ogDescription: 'Complete client-side PDF toolbox. 100% in-browser processing, no uploads required. Merge, split, compress, convert, edit text, sign contracts, and sanitize data instantly.',
    faqs: [
      {
        q: 'Does my PDF get uploaded to any server?',
        a: 'No. Unlike other tools, EditPDF processes your files entirely in your web browser. Your files never leave your device and are never uploaded to any cloud server.'
      },
      {
        q: 'What PDF tools are available in the toolbox?',
        a: 'You can edit text, find & replace, digitally sign, stamp, merge multiple PDFs, split documents, extract pages, delete pages, reorder pages, rotate pages, compress PDFs, convert PDF to JPG/PNG, convert images to PDF, watermark documents, add page numbers, flatten forms, and protect documents.'
      },
      {
        q: 'Is this PDF toolbox really free?',
        a: 'Yes, all 15+ PDF tools are 100% free to use with no hidden fees, no watermarks, no signup required, and no limits.'
      }
    ]
  },
  '/merge-pdf': {
    title: 'Merge PDF Online Free | Private Browser PDF Merger (No Upload)',
    description: 'Combine multiple PDF files into one document directly in your browser. 100% private, no signup, no file upload, and instant client-side processing.',
    keywords: 'merge pdf online free, combine pdf files, private pdf merger, join pdf documents, client side pdf merge, no upload pdf merger',
    canonical: 'https://editpdf.adwyzors.com/merge-pdf',
    ogTitle: 'Merge PDF Online Free - 100% In-Browser PDF Merger',
    ogDescription: 'Merge PDF documents locally in your browser. Fast, secure, and zero server upload.',
    faqs: [
      {
        q: 'How do I merge PDF files privately?',
        a: 'Drag and drop your PDF files into our merger tool, arrange them in your preferred order, and click "Merge PDFs". The entire operation is computed client-side in your browser.'
      }
    ]
  },
  '/split-pdf': {
    title: 'Split PDF Online Free | Extract Pages & Split by Range (No Upload)',
    description: 'Split PDF files into individual pages or custom page ranges. Download as single PDFs or a ZIP bundle with 100% client-side privacy.',
    keywords: 'split pdf online free, extract pdf pages, separate pdf document, split pdf by range, private pdf splitter',
    canonical: 'https://editpdf.adwyzors.com/split-pdf',
    ogTitle: 'Split PDF Online Free - In-Browser PDF Splitter',
    ogDescription: 'Split PDF documents by single pages, custom ranges, or intervals with zero server upload.',
    faqs: [
      {
        q: 'Can I split a PDF into specific page ranges?',
        a: 'Yes! You can specify custom range bundles like "1-5, 6-10, 11-20" or split every single page into individual files.'
      }
    ]
  },
  '/extract-pdf-pages': {
    title: 'Extract PDF Pages Online | Save Selected Pages to New PDF (Free)',
    description: 'Extract specific pages or page ranges from a PDF into a new PDF document. 100% private in-browser processing.',
    keywords: 'extract pdf pages, save selected pages from pdf, extract pages from pdf online free, private pdf extractor',
    canonical: 'https://editpdf.adwyzors.com/extract-pdf-pages',
    ogTitle: 'Extract PDF Pages Online - 100% Private',
    ogDescription: 'Save selected PDF pages into a new document instantly in your browser.',
    faqs: [
      {
        q: 'How do I extract only certain pages from a PDF?',
        a: 'Upload your PDF, enter the page numbers or ranges (e.g. 1-3, 7, 12), and click Extract Selected Pages.'
      }
    ]
  },
  '/delete-pdf-pages': {
    title: 'Delete PDF Pages Online | Remove Pages from PDF Free & Privately',
    description: 'Remove unwanted pages or sections from your PDF document easily. Fast, secure, and processed 100% in your browser.',
    keywords: 'delete pdf pages, remove pages from pdf, delete pages from pdf online, private pdf page remover',
    canonical: 'https://editpdf.adwyzors.com/delete-pdf-pages',
    ogTitle: 'Delete PDF Pages Online - Fast & Private',
    ogDescription: 'Remove unwanted pages from PDF files with zero cloud upload.',
    faqs: [
      {
        q: 'Can I delete multiple pages at once?',
        a: 'Yes, specify any single pages or ranges (e.g. 2, 5-7) to delete them in one click.'
      }
    ]
  },
  '/reorder-pdf-pages': {
    title: 'Reorder PDF Pages Online | Rearrange PDF Page Sequence Free',
    description: 'Reorganize and reorder pages in your PDF document with intuitive controls. 100% private in-browser tool.',
    keywords: 'reorder pdf pages, rearrange pdf pages, organize pdf pages online, sort pdf pages free',
    canonical: 'https://editpdf.adwyzors.com/reorder-pdf-pages',
    ogTitle: 'Reorder PDF Pages Online Free',
    ogDescription: 'Rearrange PDF page sequences in your browser with zero server upload.',
    faqs: [
      {
        q: 'How do I reorder pages in my PDF?',
        a: 'Upload your file, use the left and right move arrows to position pages in your desired sequence, and click Save New Page Order.'
      }
    ]
  },
  '/rotate-pdf': {
    title: 'Rotate PDF Online Free | Permanently Rotate PDF Pages (90°/180°)',
    description: 'Rotate PDF pages permanently by 90, 180, or 270 degrees. Works for all pages or selected ranges with 100% browser privacy.',
    keywords: 'rotate pdf online free, rotate pdf 90 degrees, permanent pdf rotation, flip pdf upside down, private pdf rotator',
    canonical: 'https://editpdf.adwyzors.com/rotate-pdf',
    ogTitle: 'Rotate PDF Online Free - Permanent Rotation',
    ogDescription: 'Rotate PDF pages clockwise or counter-clockwise with zero server upload.',
    faqs: [
      {
        q: 'Does this permanently rotate the PDF file?',
        a: 'Yes! The internal rotation metadata and bounding dimensions of each page are modified and saved into the exported PDF.'
      }
    ]
  },
  '/compress-pdf': {
    title: 'Compress PDF Online Free | Reduce PDF File Size (No Upload)',
    description: 'Compress and optimize PDF file sizes client-side in your browser. Downsample heavy images and optimize streams without cloud uploads.',
    keywords: 'compress pdf online free, reduce pdf file size, shrink pdf online, client side pdf compression, private pdf optimizer',
    canonical: 'https://editpdf.adwyzors.com/compress-pdf',
    ogTitle: 'Compress PDF Online Free - Private Browser Compression',
    ogDescription: 'Reduce PDF file size directly in your browser with zero server risk.',
    faqs: [
      {
        q: 'How does client-side PDF compression work?',
        a: 'Our engine cleans unreferenced object streams and downsamples high-resolution scanned raster images right inside your browser canvas.'
      }
    ]
  },
  '/pdf-to-jpg': {
    title: 'PDF to JPG Converter Online Free | Convert PDF to JPG Images',
    description: 'Convert PDF pages into high-resolution JPG images at 72, 150, or 300 DPI. Download individually or as a ZIP archive.',
    keywords: 'pdf to jpg, convert pdf to jpg online free, pdf to image converter, high res pdf to jpg, private pdf to jpg',
    canonical: 'https://editpdf.adwyzors.com/pdf-to-jpg',
    ogTitle: 'PDF to JPG Converter Online Free - 100% Private',
    ogDescription: 'Convert PDF documents into sharp JPG images directly in your browser.',
    faqs: [
      {
        q: 'What resolution DPI options are supported?',
        a: 'You can choose between 72 DPI (Web), 150 DPI (Standard), and 300 DPI (Print/Ultra HD).'
      }
    ]
  },
  '/pdf-to-png': {
    title: 'PDF to PNG Converter Online Free | Crisp Lossless PNG Conversion',
    description: 'Convert PDF pages into crisp, lossless PNG images. Perfect for illustrations, diagrams, and sharp text rendering.',
    keywords: 'pdf to png, convert pdf to png online free, lossless pdf to image, transparent pdf to png, private pdf to png',
    canonical: 'https://editpdf.adwyzors.com/pdf-to-png',
    ogTitle: 'PDF to PNG Converter Online Free - Lossless Quality',
    ogDescription: 'Convert PDF files into crystal-clear PNG images in your browser with zero server upload.',
    faqs: [
      {
        q: 'Why choose PNG over JPG for PDF conversion?',
        a: 'PNG is lossless and prevents compression artifacts around sharp text edges, blueprints, and diagrams.'
      }
    ]
  },
  '/jpg-to-pdf': {
    title: 'JPG to PDF Converter Online Free | Convert Images to PDF Document',
    description: 'Convert JPG images into formatted PDF documents with customizable page sizing (A4, Letter, Original) and margins.',
    keywords: 'jpg to pdf, convert jpg to pdf online free, images to pdf converter, photo to pdf, combine photos into pdf',
    canonical: 'https://editpdf.adwyzors.com/jpg-to-pdf',
    ogTitle: 'JPG to PDF Converter Online Free - 100% Private',
    ogDescription: 'Turn JPG photos and screenshots into formatted PDF documents directly in your browser.',
    faqs: [
      {
        q: 'Can I combine multiple JPG images into one PDF?',
        a: 'Yes, select multiple JPGs, reorder them as desired, choose your page size (A4, Letter, Original), and download the combined PDF.'
      }
    ]
  },
  '/png-to-pdf': {
    title: 'PNG to PDF Converter Online Free | Convert PNG Images to PDF',
    description: 'Convert PNG images into clean PDF documents with transparency preservation. 100% private in-browser processing.',
    keywords: 'png to pdf, convert png to pdf online free, combine png images into pdf, transparent png to pdf',
    canonical: 'https://editpdf.adwyzors.com/png-to-pdf',
    ogTitle: 'PNG to PDF Converter Online Free - In-Browser Processing',
    ogDescription: 'Combine PNG images into formatted PDF documents with zero server upload.',
    faqs: [
      {
        q: 'How does PNG transparency work in the converted PDF?',
        a: 'Our converter embeds PNG alpha transparency seamlessly onto standard white page backgrounds.'
      }
    ]
  },
  '/watermark-pdf': {
    title: 'Watermark PDF Online Free | Add Text Watermarks to PDF (No Upload)',
    description: 'Add customized text watermarks across PDF pages with precise control over position, opacity, font size, and rotation angle.',
    keywords: 'watermark pdf online free, add watermark to pdf, confidential watermark pdf, draft stamp pdf, private pdf watermarker',
    canonical: 'https://editpdf.adwyzors.com/watermark-pdf',
    ogTitle: 'Watermark PDF Online Free - 100% Private',
    ogDescription: 'Add text watermarks to your PDF documents directly in your browser with zero server upload.',
    faqs: [
      {
        q: 'Can I customize the watermark opacity and position?',
        a: 'Yes! You can adjust the opacity from 10% to 100%, change the rotation angle, font size, and position (center, top, bottom, corners).'
      }
    ]
  },
  '/pdf-page-numbers': {
    title: 'Add Page Numbers to PDF Online Free | Insert Header & Footer Numbers',
    description: 'Insert page numbers and headers/footers into your PDF documents with customizable formatting (e.g. "Page 1 of 10") and positioning.',
    keywords: 'add page numbers to pdf, number pdf pages online free, insert page numbers pdf, header footer page numbering pdf',
    canonical: 'https://editpdf.adwyzors.com/pdf-page-numbers',
    ogTitle: 'Add Page Numbers to PDF Online Free - In-Browser Tool',
    ogDescription: 'Number PDF pages with custom formats and positions with zero server upload.',
    faqs: [
      {
        q: 'What page numbering formats are supported?',
        a: 'We support "Page {n}", "Page {n} of {total}", "{n} of {total}", and simple number only.'
      }
    ]
  },
  '/flatten-pdf': {
    title: 'Flatten PDF Online Free | Lock Form Fields & Annotations (No Upload)',
    description: 'Flatten interactive form fields, digital signatures, stamps, and annotations into static PDF graphics to prevent tampering.',
    keywords: 'flatten pdf online free, lock form fields pdf, flatten annotations pdf, secure form flattening, private pdf flattener',
    canonical: 'https://editpdf.adwyzors.com/flatten-pdf',
    ogTitle: 'Flatten PDF Online Free - Lock Forms & Annotations',
    ogDescription: 'Flatten interactive PDF forms and annotations into non-editable static content with zero server upload.',
    faqs: [
      {
        q: 'What does flattening a PDF do?',
        a: 'Flattening bakes interactive text fields, checkmarks, signatures, and annotations directly into the page canvas so they cannot be edited or altered by third parties.'
      }
    ]
  },
  '/protect-pdf': {
    title: 'Protect PDF Online Free | Sanitize Metadata & Restrict Access (No Upload)',
    description: 'Harden document privacy, sanitize author tracking metadata, and configure security restrictions directly in your browser.',
    keywords: 'protect pdf online free, secure pdf document, sanitize pdf metadata, private pdf protection',
    canonical: 'https://editpdf.adwyzors.com/protect-pdf',
    ogTitle: 'Protect PDF Online Free - 100% Private In-Browser Protection',
    ogDescription: 'Harden PDF privacy and sanitize author tracking metadata with zero cloud upload.',
    faqs: [
      {
        q: 'Does this tool upload my password or document to any server?',
        a: 'No. Everything is executed entirely on your device inside your browser sandbox.'
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
        q: 'Can I edit numbers and transaction text on my bank statement PDF?',
        a: 'Yes. Simply open your bank statement PDF, click any transaction line or account number to edit the text directly, and export your updated PDF instantly.'
      }
    ]
  },
  '/redact-pdf-in-browser': {
    title: 'Redact PDF in Browser | Permanent In-Browser Sanitization (No Upload)',
    description: 'Permanently redact sensitive PII, SSNs, credit card numbers, and confidential text in your browser. Certified binary text layer purge.',
    keywords: 'redact pdf in browser, permanent pdf redaction, sanitize pdf online, black out text in pdf, hipaa pdf redaction, secure pdf sanitizer',
    canonical: 'https://editpdf.adwyzors.com/redact-pdf-in-browser',
    ogTitle: 'Redact PDF in Browser - True Binary Text Purge',
    ogDescription: 'Permanently remove confidential text and PII from PDF documents without cloud transmission.',
    faqs: [
      {
        q: 'Does this create permanent redaction or just draw black rectangles?',
        a: 'Our engine performs true permanent redaction. It completely purges the underlying PDF text characters and vector glyphs from the document byte stream.'
      }
    ]
  },
  '/chrome-pdf-editor': {
    title: 'Chrome PDF Editor | Free In-Browser PDF Text Editor for Chrome & Edge',
    description: 'Fast, lightweight online PDF editor optimized for Google Chrome, Microsoft Edge, and Chromium browsers. No extensions or signups required.',
    keywords: 'chrome pdf editor, browser pdf editor, edit pdf in chrome, edge pdf editor, online pdf editor chromium, free web pdf editor',
    canonical: 'https://editpdf.adwyzors.com/chrome-pdf-editor',
    ogTitle: 'Chrome PDF Editor - Fast & Native Web Assembly Editing',
    ogDescription: 'Edit PDF text, sign forms, and insert stamps directly in Google Chrome and Microsoft Edge without installing software.',
    faqs: [
      {
        q: 'Do I need to install a Chrome extension to use this editor?',
        a: 'No! EditPDF runs entirely inside your standard browser tab as a modern WebAssembly application. No extensions or software installations are needed.'
      }
    ]
  },
  '/privacy-policy': {
    title: 'Privacy Policy | EditPDF - 100% Client-Side Privacy Guarantee',
    description: 'Read our zero-data collection privacy policy. Learn why your PDF files never leave your computer and why we cannot see, store, or sell your documents.',
    keywords: 'privacy policy, zero data collection, client side privacy, no upload pdf privacy guarantee',
    canonical: 'https://editpdf.adwyzors.com/privacy-policy',
    ogTitle: 'Privacy Policy - EditPDF Zero Data Collection Guarantee',
    ogDescription: 'Our mathematical privacy guarantee: zero document data leaves your device.',
    faqs: []
  },
  '/about': {
    title: 'About EditPDF | The Local-First, Zero-Upload PDF Toolbox',
    description: 'Learn about our mission to make PDF editing and document operations 100% private, free, and accessible directly in the browser without server storage.',
    keywords: 'about editpdf, private pdf mission, local first pdf software, client side pdf tools',
    canonical: 'https://editpdf.adwyzors.com/about',
    ogTitle: 'About EditPDF - Private, Local-First PDF Toolbox',
    ogDescription: 'Our mission: powerful, accessible PDF editing and toolbox utilities without cloud security risks.',
    faqs: []
  },
  '/terms': {
    title: 'Terms of Service | EditPDF - Free Local Document Utilities',
    description: 'Terms of service for using EditPDF client-side tools and services.',
    keywords: 'terms of service, editpdf terms, client side pdf terms',
    canonical: 'https://editpdf.adwyzors.com/terms',
    ogTitle: 'Terms of Service - EditPDF',
    ogDescription: 'Terms of service for using EditPDF.',
    faqs: []
  }
};

function generateRouteHTML(templateHtml, route, data, appHtml = '') {
  let html = templateHtml;

  // Replace Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${data.title}</title>`);

  // Replace Meta Description
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${data.description}">`);

  // Replace Meta Keywords
  html = html.replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${data.keywords}">`);

  // Replace Canonical Link
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${data.canonical}">`);

  // Replace Open Graph Tags
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${data.ogTitle || data.title}">`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${data.ogDescription || data.description}">`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${data.canonical}">`);

  // Replace Twitter Card Tags
  html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${data.ogTitle || data.title}">`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${data.ogDescription || data.description}">`);

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
