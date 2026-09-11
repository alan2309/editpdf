import { PDFDocument, PDFString } from 'pdf-lib';
import type { PDFPage } from 'pdf-lib';

export interface PdfLinkBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Only create external PDF links that cannot execute code in a reader. */
export function normalizeExternalLink(value: string): string | null {
  const candidate = value.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

/** Adds a clickable URI annotation without replacing existing page annotations. */
export function addUriLinkAnnotation(
  pdfDoc: PDFDocument,
  page: PDFPage,
  destination: string,
  bounds: PdfLinkBounds,
): boolean {
  const url = normalizeExternalLink(destination);
  const { x, y, width, height } = bounds;
  if (!url || ![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
    return false;
  }

  const annotation = pdfDoc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [x, y, x + width, y + height],
    Border: [0, 0, 0],
    A: {
      Type: 'Action',
      S: 'URI',
      URI: PDFString.of(url),
    },
  });

  page.node.addAnnot(pdfDoc.context.register(annotation));
  return true;
}
