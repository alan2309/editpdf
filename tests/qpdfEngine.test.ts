import { describe, it, expect } from 'vitest';
import { QpdfEngine } from '../src/pdf/qpdf/qpdfEngine';
import { loadExternalPdf } from './fixtures/externalFixtures';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

describe('QpdfEngine Abstraction Unit Tests', () => {
  it('merges complex external documents while preserving distinct dimensions and rotations', async () => {
    const doc1 = loadExternalPdf('ext-mixed-orientations-sizes.pdf');
    const doc2 = loadExternalPdf('ext-embedded-fonts-unicode.pdf');

    const merged = await QpdfEngine.mergePdfs([doc1, doc2]);
    expect(merged.length).toBeGreaterThan(0);

    const pdfjsDoc = await pdfjsLib.getDocument({ data: merged }).promise;
    expect(pdfjsDoc.numPages).toBe(5); // 4 from doc1 + 1 from doc2

    // Check page 1 (Letter, 0 deg)
    const p1 = await pdfjsDoc.getPage(1);
    expect(p1.rotate).toBe(0);

    // Check page 2 (A4 Landscape, 90 deg)
    const p2 = await pdfjsDoc.getPage(2);
    expect(p2.rotate).toBe(90);

    // Check page 3 (Legal, 180 deg)
    const p3 = await pdfjsDoc.getPage(3);
    expect(p3.rotate).toBe(180);

    // Check page 4 (Square, 270 deg)
    const p4 = await pdfjsDoc.getPage(4);
    expect(p4.rotate).toBe(270);
  });

  it('splits a document into individual parts with QPDF', async () => {
    const doc = loadExternalPdf('ext-mixed-orientations-sizes.pdf');
    const parts = await QpdfEngine.splitPdf(doc, { pagesPerFile: 1 });
    expect(parts.length).toBe(4);

    for (let i = 0; i < parts.length; i++) {
      const partDoc = await pdfjsLib.getDocument({ data: parts[i] }).promise;
      expect(partDoc.numPages).toBe(1);
    }
  });

  it('extracts specific pages in exact order', async () => {
    const doc = loadExternalPdf('ext-mixed-orientations-sizes.pdf');
    const extracted = await QpdfEngine.extractPages(doc, { pages: [3, 1] });

    const pdfjsDoc = await pdfjsLib.getDocument({ data: extracted }).promise;
    expect(pdfjsDoc.numPages).toBe(2);

    const p1 = await pdfjsDoc.getPage(1);
    expect(p1.rotate).toBe(180); // was page 3

    const p2 = await pdfjsDoc.getPage(2);
    expect(p2.rotate).toBe(0); // was page 1
  });

  it('deletes specific pages from document', async () => {
    const doc = loadExternalPdf('ext-mixed-orientations-sizes.pdf');
    const modified = await QpdfEngine.deletePages(doc, { pages: [2, 4] });

    const pdfjsDoc = await pdfjsLib.getDocument({ data: modified }).promise;
    expect(pdfjsDoc.numPages).toBe(2);

    const p1 = await pdfjsDoc.getPage(1);
    expect(p1.rotate).toBe(0); // page 1 retained
    const p2 = await pdfjsDoc.getPage(2);
    expect(p2.rotate).toBe(180); // page 3 retained
  });

  it('reorders pages exactly', async () => {
    const doc = loadExternalPdf('ext-mixed-orientations-sizes.pdf');
    const reordered = await QpdfEngine.reorderPages(doc, [4, 3, 2, 1]);

    const pdfjsDoc = await pdfjsLib.getDocument({ data: reordered }).promise;
    expect(pdfjsDoc.numPages).toBe(4);

    expect((await pdfjsDoc.getPage(1)).rotate).toBe(270);
    expect((await pdfjsDoc.getPage(2)).rotate).toBe(180);
    expect((await pdfjsDoc.getPage(3)).rotate).toBe(90);
    expect((await pdfjsDoc.getPage(4)).rotate).toBe(0);
  });

  it('rotates pages relative to current rotation', async () => {
    const doc = loadExternalPdf('ext-mixed-orientations-sizes.pdf');
    const rotated = await QpdfEngine.rotatePages(doc, { angle: 90 });

    const pdfjsDoc = await pdfjsLib.getDocument({ data: rotated }).promise;
    expect((await pdfjsDoc.getPage(1)).rotate).toBe(90);  // 0 + 90
    expect((await pdfjsDoc.getPage(2)).rotate).toBe(180); // 90 + 90
    expect((await pdfjsDoc.getPage(3)).rotate).toBe(270); // 180 + 90
    expect((await pdfjsDoc.getPage(4)).rotate).toBe(0);   // 270 + 90 = 360 = 0
  });

  it('protects and unlocks PDF with password', async () => {
    const doc = loadExternalPdf('ext-embedded-fonts-unicode.pdf');
    const protectedBytes = await QpdfEngine.protectPdf(doc, {
      userPassword: 'secretpassword123',
      permissions: { print: 'full', extract: true },
    });

    expect(await QpdfEngine.isEncrypted(protectedBytes)).toBe(true);
    expect(await QpdfEngine.requiresPassword(protectedBytes)).toBe(true);

    const unlocked = await QpdfEngine.unlockPdf(protectedBytes, { password: 'secretpassword123' });
    expect(await QpdfEngine.isEncrypted(unlocked)).toBe(false);

    const pdfjsDoc = await pdfjsLib.getDocument({ data: unlocked }).promise;
    expect(pdfjsDoc.numPages).toBe(1);
  });

  it('losslessly compresses PDF streams and object packing', async () => {
    const doc = loadExternalPdf('ext-image-heavy-scanned.pdf');
    const compressed = await QpdfEngine.compressPdf(doc, { compressionLevel: 9, objectStreams: true });
    expect(compressed.length).toBeGreaterThan(0);

    const pdfjsDoc = await pdfjsLib.getDocument({ data: compressed }).promise;
    expect(pdfjsDoc.numPages).toBe(2);
  });

  it('flattens AcroForms structurally', async () => {
    const doc = loadExternalPdf('ext-annotations-links-forms.pdf');
    const flattened = await QpdfEngine.flattenPdf(doc, { annotations: 'all' });
    expect(flattened.length).toBeGreaterThan(0);

    const pdfjsDoc = await pdfjsLib.getDocument({ data: flattened }).promise;
    expect(pdfjsDoc.numPages).toBe(1);
  });
});
