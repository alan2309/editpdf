import { describe, expect, it } from 'vitest';
import { PDFDict, PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { addUriLinkAnnotation, normalizeExternalLink } from '../src/pdf/links';

describe('PDF hyperlink export', () => {
  it('creates a valid URI annotation and preserves its destination after reload', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([300, 300]);

    expect(addUriLinkAnnotation(doc, page, 'https://example.com/docs', {
      x: 24,
      y: 36,
      width: 120,
      height: 20,
    })).toBe(true);

    const reloaded = await PDFDocument.load(await doc.save());
    const annotations = reloaded.getPages()[0].node.Annots();
    expect(annotations?.size()).toBe(1);

    const annotation = reloaded.context.lookup(annotations!.get(0), PDFDict);
    const action = annotation.lookup(PDFName.of('A'), PDFDict);
    const uri = action.lookup(PDFName.of('URI'), PDFString);
    expect(uri.decodeText()).toBe('https://example.com/docs');
  });

  it('allows only safe external destinations', () => {
    expect(normalizeExternalLink('https://example.com/a path')).toBe('https://example.com/a%20path');
    expect(normalizeExternalLink('mailto:hello@example.com')).toBe('mailto:hello@example.com');
    expect(normalizeExternalLink('javascript:alert(1)')).toBeNull();
    expect(normalizeExternalLink('data:text/html,unsafe')).toBeNull();
    expect(normalizeExternalLink('file:///C:/private.pdf')).toBeNull();
    expect(normalizeExternalLink('not a URL')).toBeNull();
  });

  it('does not create annotations for invalid links or invalid rectangles', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    expect(addUriLinkAnnotation(doc, page, 'javascript:alert(1)', { x: 1, y: 1, width: 10, height: 10 })).toBe(false);
    expect(addUriLinkAnnotation(doc, page, 'https://example.com', { x: 1, y: 1, width: 0, height: 10 })).toBe(false);
    expect(page.node.Annots()).toBeUndefined();
  });
});
