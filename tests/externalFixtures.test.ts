import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { generateExternalFixtures } from './fixtures/generateExternalFixtures';
import { loadExternalPdf } from './fixtures/externalFixtures';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

describe('External Real-World PDF Fixtures', () => {
  it('generates and loads all 5 external fixtures', async () => {
    const dir = path.resolve(__dirname, 'fixtures/external');
    await generateExternalFixtures(dir);

    const files = [
      'ext-embedded-fonts-unicode.pdf',
      'ext-image-heavy-scanned.pdf',
      'ext-mixed-orientations-sizes.pdf',
      'ext-annotations-links-forms.pdf',
      'ext-transparency-vectors.pdf',
    ];

    for (const file of files) {
      const bytes = loadExternalPdf(file);
      expect(bytes.length).toBeGreaterThan(0);

      // Verify each with PDF.js
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      expect(doc.numPages).toBeGreaterThan(0);
      const page1 = await doc.getPage(1);
      expect(page1.view[2]).toBeGreaterThan(0); // width
      expect(page1.view[3]).toBeGreaterThan(0); // height
    }
  });
});
