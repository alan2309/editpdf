import { describe, it, expect } from 'vitest';
import { createPdfToolkit } from 'pdfstudio';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

describe('pdfstudio qpdf WASM test', () => {
  it('encrypts and decrypts a real PDF document with preserved content', async () => {
    // 1. Create a PDF with text and graphics
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 400]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText('CONFIDENTIAL FINANCIAL STATEMENT #98213', {
      x: 50,
      y: 350,
      size: 16,
      font,
      color: rgb(0.1, 0.2, 0.8),
    });
    const originalBytes = await doc.save();

    // 2. Initialize QPDF WebAssembly toolkit
    const pdfToolkit = await createPdfToolkit();

    // 3. Lock PDF with AES-256 and restrictions
    const lockedBytes = await pdfToolkit.lock(originalBytes, {
      userPassword: 'SecretPassword99!',
      keyLength: 256,
      permissions: {
        print: 'none',
        extract: false,
        modify: 'none',
      },
    });

    expect(lockedBytes.length).toBeGreaterThan(100);
    expect(await pdfToolkit.isEncrypted(lockedBytes)).toBe(true);

    // 4. Verify wrong password fails
    await expect(
      pdfToolkit.unlock(lockedBytes, { password: 'WrongPassword' })
    ).rejects.toThrow();

    // 5. Verify correct password unlocks and content is preserved
    const unlockedBytes = await pdfToolkit.unlock(lockedBytes, {
      password: 'SecretPassword99!',
    });

    const parsedDoc = await PDFDocument.load(unlockedBytes);
    expect(parsedDoc.getPageCount()).toBe(1);

    // Verify with PDF.js
    const pdfjsDoc = await pdfjsLib.getDocument({ data: unlockedBytes }).promise;
    expect(pdfjsDoc.numPages).toBe(1);
    const page1 = await pdfjsDoc.getPage(1);
    const textContent = await page1.getTextContent();
    const allText = textContent.items.map((it: any) => it.str).join(' ');
    expect(allText).toContain('CONFIDENTIAL FINANCIAL STATEMENT');
  });
});
