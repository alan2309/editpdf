import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

// Minimal 1x1 base64 JPEG for embedding
const SAMPLE_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function createSimpleTextPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  page.drawText('EditPDF Test Document - Simple Text Content', {
    x: 50,
    y: 780,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText('This paragraph contains selectable vector text for compression fidelity testing.', {
    x: 50,
    y: 740,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  return doc.save();
}

export async function createImageHeavyPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const img = await doc.embedJpg(base64ToUint8(SAMPLE_JPEG_BASE64));
  const page = doc.addPage([595, 842]);
  page.drawImage(img, { x: 50, y: 400, width: 400, height: 300 });
  page.drawImage(img, { x: 50, y: 50, width: 400, height: 300 });
  return doc.save();
}

export async function createMixedContentPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const img = await doc.embedJpg(base64ToUint8(SAMPLE_JPEG_BASE64));
  const page = doc.addPage([595, 842]);

  // Vector graphics
  page.drawRectangle({
    x: 40,
    y: 700,
    width: 515,
    height: 60,
    color: rgb(0.2, 0.4, 0.9),
  });

  // Vector text
  page.drawText('Mixed Content: Vectors, Text & Raster Image', {
    x: 60,
    y: 725,
    size: 14,
    font,
    color: rgb(1, 1, 1),
  });

  // Embedded raster image
  page.drawImage(img, { x: 50, y: 300, width: 300, height: 200 });
  return doc.save();
}

export async function createMultiPagePdf(count = 5): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= count; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`Multi-Page PDF - Page ${i} of ${count}`, {
      x: 50,
      y: 780,
      size: 16,
      font,
    });
  }
  return doc.save();
}

export async function createDifferentPageSizesPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  // Page 1: US Letter (612 x 792)
  const p1 = doc.addPage([612, 792]);
  p1.drawText('Page 1: US Letter (612x792)', { x: 50, y: 700, size: 14, font });

  // Page 2: A4 Portrait (595 x 842)
  const p2 = doc.addPage([595, 842]);
  p2.drawText('Page 2: A4 Portrait (595x842)', { x: 50, y: 750, size: 14, font });

  // Page 3: A4 Landscape (842 x 595)
  const p3 = doc.addPage([842, 595]);
  p3.drawText('Page 3: A4 Landscape (842x595)', { x: 50, y: 500, size: 14, font });

  return doc.save();
}

export async function createRotatedPagesPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const p1 = doc.addPage([600, 400]);
  p1.setRotation(degrees(0));
  p1.drawText('Page 1 (0 deg)', { x: 50, y: 350, size: 16, font });

  const p2 = doc.addPage([600, 400]);
  p2.setRotation(degrees(90));
  p2.drawText('Page 2 (90 deg)', { x: 50, y: 350, size: 16, font });

  const p3 = doc.addPage([600, 400]);
  p3.setRotation(degrees(180));
  p3.drawText('Page 3 (180 deg)', { x: 50, y: 350, size: 16, font });

  const p4 = doc.addPage([600, 400]);
  p4.setRotation(degrees(270));
  p4.drawText('Page 4 (270 deg)', { x: 50, y: 350, size: 16, font });

  return doc.save();
}

export async function createTransparentContentPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([600, 400]);

  page.drawRectangle({
    x: 50,
    y: 100,
    width: 200,
    height: 200,
    color: rgb(1, 0, 0),
    opacity: 0.5,
  });

  page.drawRectangle({
    x: 150,
    y: 150,
    width: 200,
    height: 200,
    color: rgb(0, 0, 1),
    opacity: 0.5,
  });

  page.drawText('Transparency Overlap Test', {
    x: 60,
    y: 350,
    size: 16,
    font,
  });

  return doc.save();
}
