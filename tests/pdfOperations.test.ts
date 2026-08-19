import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfs } from '../src/pdf/mergePdf';
import { splitPdf } from '../src/pdf/splitPdf';
import { extractPages } from '../src/pdf/extractPages';
import { deletePages } from '../src/pdf/deletePages';
import { reorderPages } from '../src/pdf/reorderPages';
import { rotatePages } from '../src/pdf/rotatePages';
import { addWatermarkToPdf } from '../src/pdf/watermarkPdf';
import { addPageNumbersToPdf } from '../src/pdf/pageNumbers';
import { flattenPdf } from '../src/pdf/flattenPdf';
import { protectPdf } from '../src/pdf/protectPdf';
import { loadExternalPdf } from './fixtures/externalFixtures';
import { QpdfEngine } from '../src/pdf/qpdf/qpdfEngine';

function makeExternalFile(filename: string): File {
  const bytes = loadExternalPdf(filename);
  return new File([bytes as BlobPart], filename, { type: 'application/pdf' });
}

describe('PDF Operations - Production Integration Suite', () => {
  it('merges multiple external PDF files preserving page count and rotations', async () => {
    const file1 = makeExternalFile('ext-mixed-orientations-sizes.pdf'); // 4 pages
    const file2 = makeExternalFile('ext-embedded-fonts-unicode.pdf');    // 1 page

    const result = await mergePdfs([file1, file2]);
    expect(result.pageCount).toBe(5);
    expect(result.fileName).toBe('ext-mixed-orientations-sizes-merged.pdf');
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('splits external PDF into single pages (ZIP archive)', async () => {
    const file = makeExternalFile('ext-mixed-orientations-sizes.pdf');
    const result = await splitPdf(file, { mode: 'every-page' });

    expect(result.isZip).toBe(true);
    expect(result.fileName).toBe('ext-mixed-orientations-sizes-split.zip');
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('splits external PDF with custom ranges (Group syntax)', async () => {
    const file = makeExternalFile('ext-mixed-orientations-sizes.pdf');
    const result = await splitPdf(file, {
      mode: 'ranges',
      ranges: '1-2\n3-4',
    });

    expect(result.isZip).toBe(true);
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('extracts specific pages from external PDF', async () => {
    const file = makeExternalFile('ext-mixed-orientations-sizes.pdf');
    const result = await extractPages(file, '1, 3');

    expect(result.pageCount).toBe(2);
    expect(result.fileName).toBe('ext-mixed-orientations-sizes-extracted.pdf');
  });

  it('deletes specific pages from external PDF', async () => {
    const file = makeExternalFile('ext-mixed-orientations-sizes.pdf');
    const result = await deletePages(file, '2, 4');

    expect(result.pageCount).toBe(2);
    expect(result.fileName).toBe('ext-mixed-orientations-sizes-modified.pdf');
  });

  it('reorders pages in external PDF', async () => {
    const file = makeExternalFile('ext-mixed-orientations-sizes.pdf');
    const result = await reorderPages(file, [4, 3, 2, 1]);

    expect(result.pageCount).toBe(4);
    expect(result.fileName).toBe('ext-mixed-orientations-sizes-reordered.pdf');
  });

  it('rotates pages in external PDF by 90 degrees', async () => {
    const file = makeExternalFile('ext-mixed-orientations-sizes.pdf');
    const result = await rotatePages(file, {
      rotation: 90,
      pagesMode: 'all',
    });

    expect(result.pageCount).toBe(4);
    expect(result.fileName).toBe('ext-mixed-orientations-sizes-rotated.pdf');
  });

  it('adds watermark to external PDF', async () => {
    const file = makeExternalFile('ext-embedded-fonts-unicode.pdf');
    const result = await addWatermarkToPdf(file, {
      text: 'CONFIDENTIAL',
      fontSize: 36,
      opacity: 0.4,
      rotation: 45,
      position: 'center',
      color: '#dc2626',
      pagesMode: 'all',
    });

    expect(result.fileName).toBe('ext-embedded-fonts-unicode-watermarked.pdf');
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('adds page numbers to external PDF', async () => {
    const file = makeExternalFile('ext-mixed-orientations-sizes.pdf');
    const result = await addPageNumbersToPdf(file, {
      format: 'page-n-of-total',
      position: 'bottom-center',
      startNumber: 1,
      fontSize: 10,
      color: '#333333',
      margin: 25,
      pagesMode: 'all',
    });

    expect(result.fileName).toBe('ext-mixed-orientations-sizes-numbered.pdf');
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('performs non-destructive structural flattening on AcroForm document', async () => {
    const file = makeExternalFile('ext-annotations-links-forms.pdf');
    const result = await flattenPdf(file);

    expect(result.fileName).toBe('ext-annotations-links-forms-flattened.pdf');
    expect(result.pageCount).toBe(1);
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('applies genuine standard PDF encryption with /Encrypt dictionary and decrypts with password', async () => {
    const file = makeExternalFile('ext-embedded-fonts-unicode.pdf');
    const result = await protectPdf(file, {
      password: 'mypassword123',
      permissions: {
        printing: false,
        copying: false,
        modifying: false,
      },
    });

    expect(result.fileName).toBe('ext-embedded-fonts-unicode-protected.pdf');
    expect(result.blob.size).toBeGreaterThan(0);

    const buffer = await result.blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Verify it is genuinely encrypted
    expect(await QpdfEngine.isEncrypted(bytes)).toBe(true);

    // Verify unlocking with correct password recovers original document
    const decryptedBytes = await QpdfEngine.unlockPdf(bytes, { password: 'mypassword123' });
    const decryptedDoc = await PDFDocument.load(decryptedBytes);
    expect(decryptedDoc.getPageCount()).toBe(1);

    // Verify wrong password rejects
    await expect(
      QpdfEngine.unlockPdf(bytes, { password: 'WrongPassword' })
    ).rejects.toThrow();
  });
});
