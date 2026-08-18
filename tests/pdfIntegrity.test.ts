import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { verifyPdf } from '../src/pdf/verifyPdf';

describe('PDF Integrity Verification', () => {
  it('validates a correct PDF document', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([595, 842]);
    doc.addPage([595, 842]);
    const bytes = await doc.save();

    const report = await verifyPdf(bytes, 2);
    expect(report.isValid).toBe(true);
    expect(report.pageCount).toBe(2);
    expect(report.hasValidHeader).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it('detects page count mismatches', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([595, 842]);
    const bytes = await doc.save();

    const report = await verifyPdf(bytes, 5); // Expected 5, actual 1
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes('Page count mismatch'))).toBe(true);
  });

  it('rejects empty byte streams', async () => {
    const emptyBytes = new Uint8Array(0);
    const report = await verifyPdf(emptyBytes);
    expect(report.isValid).toBe(false);
    expect(report.hasValidHeader).toBe(false);
  });

  it('rejects invalid or corrupted headers', async () => {
    const encoder = new TextEncoder();
    const fakeBytes = encoder.encode('NOT A VALID PDF FILE CONTENT');
    const report = await verifyPdf(fakeBytes);
    expect(report.isValid).toBe(false);
    expect(report.hasValidHeader).toBe(false);
  });
});
