import { describe, it, expect } from 'vitest';
import { createPdfToolkit } from 'pdfstudio';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createMultiPagePdf } from './fixtures/createFixtures';

describe('Phase 0: QPDF WASM Proof of Concept', () => {
  it('loads /qpdf.wasm, transforms a real PDF, and verifies with PDF.js', async () => {
    // 1. Load toolkit
    const toolkit = await createPdfToolkit();
    expect(toolkit).toBeDefined();

    // 2. Load one real PDF
    const initialBytes = await createMultiPagePdf(4);
    const countBefore = await toolkit.pageCount(initialBytes);
    expect(countBefore).toBe(4);

    // 3. Execute a QPDF operation (extract pages 1, 3 and rotate by 90 degrees)
    const extractedBytes = await toolkit.extractPages(initialBytes, { pages: [1, 3] });
    expect(extractedBytes.length).toBeGreaterThan(0);

    const rotatedBytes = await toolkit.rotate(extractedBytes, { angle: 90 });
    expect(rotatedBytes.length).toBeGreaterThan(0);

    // 4. Open result with PDF.js
    const pdfjsDoc = await pdfjsLib.getDocument({ data: rotatedBytes }).promise;
    expect(pdfjsDoc.numPages).toBe(2);

    // 5. Verify page properties with PDF.js
    const page1 = await pdfjsDoc.getPage(1);
    expect(page1.rotate).toBe(90);

    const textContent = await page1.getTextContent();
    const textStr = textContent.items.map((it: any) => it.str).join(' ');
    expect(textStr).toContain('Page 1');

    const page2 = await pdfjsDoc.getPage(2);
    expect(page2.rotate).toBe(90);
    const text2 = (await page2.getTextContent()).items.map((it: any) => it.str).join(' ');
    expect(text2).toContain('Page 3');
  });
});
