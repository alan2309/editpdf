import { PDFDocument, rgb, degrees, StandardFonts, PDFName, PDFDict, PDFArray, PDFString, PDFNumber } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

// Minimal 1x1 JPEG base64 for images
const JPEG_1 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

function b64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function generateExternalFixtures(targetDir: string) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. ext-embedded-fonts-unicode.pdf
  {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([595.28, 841.89]); // A4
    page.drawText('Real-World External Fixture: Unicode & Embedded Text', { x: 50, y: 780, size: 16, font, color: rgb(0.1, 0.1, 0.1) });
    page.drawText('Unicode glyphs and symbols: © ® ™ € £ ¥ § ¶ µ', { x: 50, y: 740, size: 12, font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText('Multilingual metadata & accented strings: Café, Noël, Über, São Paulo, Zygmunt', { x: 50, y: 700, size: 12, font, color: rgb(0.2, 0.2, 0.2) });
    doc.setTitle('External Unicode Document with Metadata - © 2026 EditPDF');
    doc.setAuthor('EditPDF Verification Suite');
    doc.setSubject('PDF Engine Rebuild Quality Assurance');
    fs.writeFileSync(path.join(targetDir, 'ext-embedded-fonts-unicode.pdf'), await doc.save());
  }

  // 2. ext-image-heavy-scanned.pdf
  {
    const doc = await PDFDocument.create();
    const img1 = await doc.embedJpg(b64ToUint8(JPEG_1));
    const page1 = doc.addPage([612, 792]);
    page1.drawImage(img1, { x: 40, y: 400, width: 532, height: 350 });
    page1.drawImage(img1, { x: 40, y: 40, width: 532, height: 350 });
    const page2 = doc.addPage([612, 792]);
    page2.drawImage(img1, { x: 50, y: 100, width: 500, height: 600 });
    fs.writeFileSync(path.join(targetDir, 'ext-image-heavy-scanned.pdf'), await doc.save());
  }

  // 3. ext-mixed-orientations-sizes.pdf
  {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    // Page 1: US Letter Portrait 0 deg
    const p1 = doc.addPage([612, 792]);
    p1.setRotation(degrees(0));
    p1.drawText('Page 1: US Letter Portrait (612x792, Rot 0)', { x: 50, y: 700, size: 14, font });

    // Page 2: A4 Landscape 90 deg
    const p2 = doc.addPage([842, 595]);
    p2.setRotation(degrees(90));
    p2.drawText('Page 2: A4 Landscape (842x595, Rot 90)', { x: 50, y: 500, size: 14, font });

    // Page 3: US Legal Portrait 180 deg
    const p3 = doc.addPage([612, 1008]);
    p3.setRotation(degrees(180));
    p3.drawText('Page 3: US Legal Portrait (612x1008, Rot 180)', { x: 50, y: 900, size: 14, font });

    // Page 4: Square 500x500 270 deg
    const p4 = doc.addPage([500, 500]);
    p4.setRotation(degrees(270));
    p4.drawText('Page 4: Custom Square (500x500, Rot 270)', { x: 50, y: 400, size: 14, font });

    fs.writeFileSync(path.join(targetDir, 'ext-mixed-orientations-sizes.pdf'), await doc.save());
  }

  // 4. ext-annotations-links-forms.pdf
  {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([595, 842]);
    page.drawText('Interactive AcroForm & Annotation Document', { x: 50, y: 780, size: 16, font });

    const form = doc.getForm();
    const textField = form.createTextField('applicant_name');
    textField.setText('Jane Doe');
    textField.addToPage(page, { x: 50, y: 700, width: 250, height: 30 });

    const checkBox = form.createCheckBox('agree_terms');
    checkBox.check();
    checkBox.addToPage(page, { x: 50, y: 640, width: 20, height: 20 });
    page.drawText('I agree to the terms and conditions', { x: 80, y: 645, size: 12, font });

    fs.writeFileSync(path.join(targetDir, 'ext-annotations-links-forms.pdf'), await doc.save());
  }

  // 5. ext-transparency-vectors.pdf
  {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([600, 600]);
    page.drawText('Vector Graphics with Blend Opacity & Transparency', { x: 50, y: 550, size: 14, font });

    // Overlapping translucent circles/rectangles
    page.drawRectangle({ x: 100, y: 250, width: 200, height: 200, color: rgb(1, 0, 0), opacity: 0.5 });
    page.drawRectangle({ x: 200, y: 250, width: 200, height: 200, color: rgb(0, 1, 0), opacity: 0.5 });
    page.drawRectangle({ x: 150, y: 150, width: 200, height: 200, color: rgb(0, 0, 1), opacity: 0.5 });

    fs.writeFileSync(path.join(targetDir, 'ext-transparency-vectors.pdf'), await doc.save());
  }
}
