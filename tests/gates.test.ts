import { describe, it, expect } from 'vitest';
import { PDFDocument, PDFName, PDFNumber } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { QpdfEngine } from '../src/pdf/qpdf/qpdfEngine';
import { loadExternalPdf } from './fixtures/externalFixtures';
import { verifyPdf } from '../src/pdf/verifyPdf';

describe('PDF Engine Rebuild: 4 Verification Gates', () => {
  // =========================================================================
  // GATE 1: Prove QPDF WASM actually works in runtime
  // =========================================================================
  it('GATE 1: QPDF WASM loads, executes structure transform, and renders in PDF.js', async () => {
    const docBytes = loadExternalPdf('ext-mixed-orientations-sizes.pdf');
    expect(docBytes.length).toBeGreaterThan(0);

    const count = await QpdfEngine.getPageCount(docBytes);
    expect(count).toBe(4);

    const extracted = await QpdfEngine.extractPages(docBytes, { pages: [1, 2] });
    expect(extracted.length).toBeGreaterThan(0);

    const pdfjsDoc = await pdfjsLib.getDocument({ data: extracted }).promise;
    expect(pdfjsDoc.numPages).toBe(2);

    const p1 = await pdfjsDoc.getPage(1);
    expect(p1.view[2]).toBe(612); // Letter width
    expect(p1.view[3]).toBe(792); // Letter height
    expect(p1.rotate).toBe(0);

    const p2 = await pdfjsDoc.getPage(2);
    expect(p2.view[2]).toBe(842); // A4 Landscape width
    expect(p2.view[3]).toBe(595); // A4 Landscape height
    expect(p2.rotate).toBe(90);
  });

  // =========================================================================
  // GATE 2: Prove QPDF merge on real complex, multi-dimension, multi-rotation PDFs
  // =========================================================================
  it('GATE 2: Merges real complex external PDFs preserving exact dimensions and rotations', async () => {
    const mixedDoc = loadExternalPdf('ext-mixed-orientations-sizes.pdf'); // 4 pages
    const unicodeDoc = loadExternalPdf('ext-embedded-fonts-unicode.pdf'); // 1 page
    const formsDoc = loadExternalPdf('ext-annotations-links-forms.pdf');   // 1 page

    const mergedBytes = await QpdfEngine.mergePdfs([mixedDoc, unicodeDoc, formsDoc]);
    expect(mergedBytes.length).toBeGreaterThan(0);

    const pdfjsDoc = await pdfjsLib.getDocument({ data: mergedBytes }).promise;
    expect(pdfjsDoc.numPages).toBe(6);

    // Verify Page 1 (Letter, 0 deg)
    const p1 = await pdfjsDoc.getPage(1);
    expect(p1.view[2]).toBe(612);
    expect(p1.view[3]).toBe(792);
    expect(p1.rotate).toBe(0);

    // Verify Page 2 (A4 Landscape, 90 deg)
    const p2 = await pdfjsDoc.getPage(2);
    expect(p2.view[2]).toBe(842);
    expect(p2.view[3]).toBe(595);
    expect(p2.rotate).toBe(90);

    // Verify Page 3 (Legal, 180 deg)
    const p3 = await pdfjsDoc.getPage(3);
    expect(p3.view[2]).toBe(612);
    expect(p3.view[3]).toBe(1008);
    expect(p3.rotate).toBe(180);

    // Verify Page 4 (Square, 270 deg)
    const p4 = await pdfjsDoc.getPage(4);
    expect(p4.view[2]).toBe(500);
    expect(p4.view[3]).toBe(500);
    expect(p4.rotate).toBe(270);

    // Verify Page 5 (Unicode text)
    const p5 = await pdfjsDoc.getPage(5);
    const textContent5 = await p5.getTextContent();
    const str5 = textContent5.items.map((it: any) => it.str).join(' ');
    expect(str5).toContain('Unicode');

    // Verify Page 6 (Forms)
    const p6 = await pdfjsDoc.getPage(6);
    expect(p6.view[2]).toBeCloseTo(595.28, 0);
  });

  // =========================================================================
  // GATE 3: Prove QPDF encryption produces genuine password protected PDF
  // =========================================================================
  it('GATE 3: Protects with AES-256; wrong password fails, correct password opens and renders', async () => {
    const unicodeDoc = loadExternalPdf('ext-embedded-fonts-unicode.pdf');

    const protectedBytes = await QpdfEngine.protectPdf(unicodeDoc, {
      userPassword: 'Gate3PasswordSecure',
      permissions: { print: 'full', extract: true },
    });

    expect(await QpdfEngine.isEncrypted(protectedBytes)).toBe(true);
    expect(await QpdfEngine.requiresPassword(protectedBytes)).toBe(true);

    // Wrong password in QPDF fails
    await expect(
      QpdfEngine.unlockPdf(protectedBytes, { password: 'WrongPassword' })
    ).rejects.toThrow();

    // Correct password decrypts and recovers full document
    const unlockedBytes = await QpdfEngine.unlockPdf(protectedBytes, { password: 'Gate3PasswordSecure' });
    expect(await QpdfEngine.isEncrypted(unlockedBytes)).toBe(false);

    const pdfjsDoc = await pdfjsLib.getDocument({ data: unlockedBytes }).promise;
    expect(pdfjsDoc.numPages).toBe(1);

    const page1 = await pdfjsDoc.getPage(1);
    const textContent = await page1.getTextContent();
    const str = textContent.items.map((it: any) => it.str).join(' ');
    expect(str).toContain('Real-World External Fixture');
  });

  // =========================================================================
  // GATE 4: Prove output verification catches intentionally corrupted/distorted/mis-rotated PDFs
  // =========================================================================
  it('GATE 4: Verification rejects corrupt, 0-page, invalid dimension, non-orthogonal rotation, and mismatched counts', async () => {
    // 1. Corrupt byte stream
    const corruptBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x00, 0xff, 0xee]);
    const resCorrupt = await verifyPdf(corruptBytes);
    expect(resCorrupt.isValid).toBe(false);
    expect(resCorrupt.errors.length).toBeGreaterThan(0);

    // 2. Empty byte stream
    const resEmpty = await verifyPdf(new Uint8Array(0));
    expect(resEmpty.isValid).toBe(false);

    // 3. Expected page count mismatch
    const realDoc = loadExternalPdf('ext-mixed-orientations-sizes.pdf'); // 4 pages
    const resMismatch = await verifyPdf(realDoc, 2); // expects 2 pages
    expect(resMismatch.isValid).toBe(false);
    expect(resMismatch.errors.some(e => e.includes('Page count mismatch'))).toBe(true);

    // 4. Invalid dimensions (width <= 0)
    const docZeroDim = await PDFDocument.create();
    docZeroDim.addPage([0, 0]);
    const bytesZeroDim = await docZeroDim.save();
    const resZeroDim = await verifyPdf(bytesZeroDim);
    expect(resZeroDim.isValid).toBe(false);
    expect(resZeroDim.errors.some(e => e.includes('invalid dimensions'))).toBe(true);

    // 5. Non-orthogonal rotation (raw dictionary Rotate: 45)
    const docBadRot = await PDFDocument.create();
    const pRot = docBadRot.addPage([595, 842]);
    pRot.node.set(PDFName.of('Rotate'), PDFNumber.of(45));
    const bytesBadRot = await docBadRot.save();
    const resBadRot = await verifyPdf(bytesBadRot);
    expect(resBadRot.isValid).toBe(false);
    expect(resBadRot.errors.some(e => e.includes('non-orthogonal rotation'))).toBe(true);
  });
});
