import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfs } from '../src/pdf/mergePdf';
import { extractPages } from '../src/pdf/extractPages';
import { deletePages } from '../src/pdf/deletePages';
import { reorderPages } from '../src/pdf/reorderPages';
import { rotatePages } from '../src/pdf/rotatePages';
import { addWatermarkToPdf } from '../src/pdf/watermarkPdf';
import { addPageNumbersToPdf } from '../src/pdf/pageNumbers';
import { flattenPdf } from '../src/pdf/flattenPdf';
import { protectPdf } from '../src/pdf/protectPdf';

async function createSamplePdfFile(pageCount = 3, name = 'sample.pdf'): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([595, 842]);
  }
  const bytes = await doc.save();
  return new File([bytes as BlobPart], name, { type: 'application/pdf' });
}

describe('pdf operations', () => {
  it('merges multiple PDF files', async () => {
    const file1 = await createSamplePdfFile(2, 'doc1.pdf');
    const file2 = await createSamplePdfFile(3, 'doc2.pdf');

    const result = await mergePdfs([file1, file2]);
    expect(result.pageCount).toBe(5);
    expect(result.fileName).toBe('doc1-merged.pdf');
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('extracts specific pages from PDF', async () => {
    const file = await createSamplePdfFile(5, 'doc.pdf');
    const result = await extractPages(file, '1, 3, 5');

    expect(result.pageCount).toBe(3);
    expect(result.fileName).toBe('doc-extracted.pdf');
  });

  it('deletes specific pages from PDF', async () => {
    const file = await createSamplePdfFile(5, 'doc.pdf');
    const result = await deletePages(file, '2, 4');

    expect(result.pageCount).toBe(3);
    expect(result.fileName).toBe('doc-modified.pdf');
  });

  it('reorders pages in PDF', async () => {
    const file = await createSamplePdfFile(4, 'doc.pdf');
    const result = await reorderPages(file, [4, 3, 2, 1]);

    expect(result.pageCount).toBe(4);
    expect(result.fileName).toBe('doc-reordered.pdf');
  });

  it('rotates pages in PDF', async () => {
    const file = await createSamplePdfFile(3, 'doc.pdf');
    const result = await rotatePages(file, {
      rotation: 90,
      pagesMode: 'all',
    });

    expect(result.pageCount).toBe(3);
    expect(result.fileName).toBe('doc-rotated.pdf');
  });

  it('adds watermark to PDF', async () => {
    const file = await createSamplePdfFile(2, 'doc.pdf');
    const result = await addWatermarkToPdf(file, {
      text: 'CONFIDENTIAL',
      fontSize: 36,
      opacity: 0.4,
      rotation: 45,
      position: 'center',
      color: '#dc2626',
      pagesMode: 'all',
    });

    expect(result.fileName).toBe('doc-watermarked.pdf');
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('adds page numbers to PDF', async () => {
    const file = await createSamplePdfFile(3, 'doc.pdf');
    const result = await addPageNumbersToPdf(file, {
      format: 'page-n-of-total',
      position: 'bottom-center',
      startNumber: 1,
      fontSize: 10,
      color: '#333333',
      margin: 25,
      pagesMode: 'all',
    });

    expect(result.fileName).toBe('doc-numbered.pdf');
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('performs non-destructive structural flattening', async () => {
    const file = await createSamplePdfFile(2, 'form.pdf');
    const result = await flattenPdf(file);

    expect(result.fileName).toBe('form-flattened.pdf');
    expect(result.pageCount).toBe(2);
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('applies genuine standard PDF encryption with /Encrypt dictionary and decrypts with password', async () => {
    const file = await createSamplePdfFile(2, 'secret.pdf');
    const result = await protectPdf(file, {
      password: 'mypassword123',
      permissions: {
        printing: false,
        copying: false,
        modifying: false,
      },
    });

    expect(result.fileName).toBe('secret-protected.pdf');
    expect(result.blob.size).toBeGreaterThan(0);

    const buffer = await result.blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Verify it is genuinely encrypted
    const { createPdfToolkit } = await import('pdfstudio');
    const toolkit = await createPdfToolkit();
    expect(await toolkit.isEncrypted(bytes)).toBe(true);

    // Verify unlocking with correct password recovers original document
    const decryptedBytes = await toolkit.unlock(bytes, { password: 'mypassword123' });
    const decryptedDoc = await PDFDocument.load(decryptedBytes);
    expect(decryptedDoc.getPageCount()).toBe(2);

    // Verify wrong password rejects
    await expect(
      toolkit.unlock(bytes, { password: 'WrongPassword' })
    ).rejects.toThrow();
  });
});
