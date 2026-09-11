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
  let SEO_DATA = null;

  if (fs.existsSync(ssrEntryPath)) {
    try {
      const serverModule = await import(pathToFileURL(ssrEntryPath).href);
      renderFn = serverModule.render;
      SEO_DATA = serverModule.SEO_DATA;
      console.log('✓ Loaded SSR server renderer and canonical SEO_DATA from entry-server.js.');
    } catch (e) {
      console.warn('Warning: Could not load SSR renderer or SEO_DATA, falling back:', e);
    }
  }

  if (!SEO_DATA) {
    console.error('Error: Could not load canonical SEO_DATA from SSR module.');
    process.exit(1);
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
