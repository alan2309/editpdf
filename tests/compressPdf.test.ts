import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { compressPdf } from '../src/pdf/compressPdf';
import {
  createSimpleTextPdf,
  createImageHeavyPdf,
  createMixedContentPdf,
  createMultiPagePdf,
  createDifferentPageSizesPdf,
  createRotatedPagesPdf,
  createTransparentContentPdf,
} from './fixtures/createFixtures';

function makeFile(bytes: Uint8Array, name: string): File {
  return new File([bytes as BlobPart], name, { type: 'application/pdf' });
}

describe('Compress PDF - Complete Test Suite', () => {
  it('TEST 1: Safe & Balanced preserve selectable text & fonts on Text PDF', async () => {
    const textPdfBytes = await createSimpleTextPdf();
    const file = makeFile(textPdfBytes, 'text-doc.pdf');

    // Safe mode
    const safeRes = await compressPdf(file, { mode: 'safe' });
    expect(safeRes.pageCount).toBe(1);
    expect(safeRes.blob.size).toBeGreaterThan(0);

    const safeDoc = await PDFDocument.load(await safeRes.blob.arrayBuffer());
    expect(safeDoc.getPageCount()).toBe(1);

    // Verify text selectability with PDF.js
    const pdfjsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(await safeRes.blob.arrayBuffer()) }).promise;
    const page1 = await pdfjsDoc.getPage(1);
    const textContent = await page1.getTextContent();
    const str = textContent.items.map((it: any) => it.str).join(' ');
    expect(str).toContain('EditPDF Test Document');
    expect(str).toContain('selectable vector text');

    // Balanced mode
    const balancedRes = await compressPdf(file, { mode: 'balanced' });
    const bDoc = await pdfjsLib.getDocument({ data: new Uint8Array(await balancedRes.blob.arrayBuffer()) }).promise;
    const bPage = await bDoc.getPage(1);
    const bText = (await bPage.getTextContent()).items.map((it: any) => it.str).join(' ');
    expect(bText).toContain('EditPDF Test Document');
  });

  it('TEST 2: Preserves distinct individual page dimensions', async () => {
    const diffSizesBytes = await createDifferentPageSizesPdf();
    const file = makeFile(diffSizesBytes, 'diff-sizes.pdf');

    const res = await compressPdf(file, { mode: 'safe' });
    const doc = await PDFDocument.load(await res.blob.arrayBuffer());
    expect(doc.getPageCount()).toBe(3);

    const p1 = doc.getPage(0);
    expect(p1.getWidth()).toBe(612);
    expect(p1.getHeight()).toBe(792);

    const p2 = doc.getPage(1);
    expect(p2.getWidth()).toBe(595);
    expect(p2.getHeight()).toBe(842);

    const p3 = doc.getPage(2);
    expect(p3.getWidth()).toBe(842);
    expect(p3.getHeight()).toBe(595);
  });

  it('TEST 3: Preserves individual page rotations', async () => {
    const rotatedBytes = await createRotatedPagesPdf();
    const file = makeFile(rotatedBytes, 'rotated.pdf');

    const res = await compressPdf(file, { mode: 'balanced' });
    const doc = await PDFDocument.load(await res.blob.arrayBuffer());
    expect(doc.getPageCount()).toBe(4);

    expect(doc.getPage(0).getRotation().angle).toBe(0);
    expect(doc.getPage(1).getRotation().angle).toBe(90);
    expect(doc.getPage(2).getRotation().angle).toBe(180);
    expect(doc.getPage(3).getRotation().angle).toBe(270);
  });

  it('TEST 4: Processes multi-page document successfully', async () => {
    const multiBytes = await createMultiPagePdf(6);
    const file = makeFile(multiBytes, 'multi-page.pdf');

    const res = await compressPdf(file, { mode: 'safe' });
    expect(res.pageCount).toBe(6);

    const doc = await PDFDocument.load(await res.blob.arrayBuffer());
    expect(doc.getPageCount()).toBe(6);
  });

  it('TEST 5: Handles transparency content without error', async () => {
    const transBytes = await createTransparentContentPdf();
    const file = makeFile(transBytes, 'transparent.pdf');

    const res = await compressPdf(file, { mode: 'balanced' });
    expect(res.pageCount).toBe(1);
    expect(res.blob.size).toBeGreaterThan(0);
  });

  it('TEST 6: Output size safeguard retains original when not smaller', async () => {
    const textBytes = await createSimpleTextPdf();
    const file = makeFile(textBytes, 'sample.pdf');

    const res = await compressPdf(file, { mode: 'safe' });
    // If output is not smaller, isOriginalRetained should be set and savings 0
    if (res.fileSize >= res.originalSize!) {
      expect(res.isCompressed).toBe(false);
      expect(res.isOriginalRetained).toBe(true);
      expect(res.compressionSavingsPercent).toBe(0);
    }
  });

  it('TEST 7: Maximum mode processes mixed content', async () => {
    const mixedBytes = await createMixedContentPdf();
    const file = makeFile(mixedBytes, 'mixed.pdf');

    const res = await compressPdf(file, { mode: 'maximum', targetDpi: 100, quality: 0.6 });
    expect(res.pageCount).toBe(1);
    expect(res.blob.size).toBeGreaterThan(0);
  });
});
