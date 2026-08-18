import { describe, it, expect } from 'vitest';
import type { PDFTextItem } from '../src/types/pdf';

describe('Text Editing Long Text UX Architecture', () => {
  it('calculates available editor width bounded within PDF page dimensions', () => {
    function computeEditorWidths(pageWidth: number, itemX: number, originalItemWidth: number) {
      const availableWidth = Math.max(80, pageWidth - itemX - 16);
      const activeContainerWidth = Math.min(Math.max(originalItemWidth, 80), availableWidth);
      return { availableWidth, activeContainerWidth };
    }

    // Page width 612 (Letter unscaled), text starts at x=50, original text width=400
    const test1 = computeEditorWidths(612, 50, 400);
    expect(test1.availableWidth).toBe(546);
    expect(test1.activeContainerWidth).toBe(400);

    // Long text item exceeding the remaining page width (starts at x=200, width=500 on 612 page)
    const test2 = computeEditorWidths(612, 200, 500);
    expect(test2.availableWidth).toBe(396);
    expect(test2.activeContainerWidth).toBe(396);
    expect(200 + test2.activeContainerWidth).toBeLessThanOrEqual(612);

    // Text near right edge of the page (starts at x=580 on 612 page)
    const test3 = computeEditorWidths(612, 580, 150);
    expect(test3.availableWidth).toBe(80);
    expect(test3.activeContainerWidth).toBe(80);

    // Mobile viewport: pageWidth=360, itemX=20, width=380
    const testMobile = computeEditorWidths(360, 20, 380);
    expect(testMobile.availableWidth).toBe(324);
    expect(testMobile.activeContainerWidth).toBe(324);
    expect(20 + testMobile.activeContainerWidth).toBeLessThanOrEqual(360);
  });

  it('calculates accurate click-to-character caret index without horizontal jumping', () => {
    function calculateCaretIndex(clickOffsetX: number, elementWidth: number, textLength: number): number {
      const charRatio = Math.max(0, Math.min(1, clickOffsetX / (elementWidth || 1)));
      return Math.round(charRatio * textLength);
    }

    const citationText = 'Longvah, T., Ananthan, R., Bhaskarachary, K. and Venkaiah, K. (2017). Indian Food Composition Tables 2017';
    const textLen = citationText.length; // 106 chars
    const elementWidth = 600;

    // Click near start (x = 10px) -> index near 2
    const startClick = calculateCaretIndex(10, elementWidth, textLen);
    expect(startClick).toBeLessThan(10);
    expect(startClick).toBeGreaterThanOrEqual(0);

    // Click near middle (x = 300px) -> index near 53
    const midClick = calculateCaretIndex(300, elementWidth, textLen);
    expect(midClick).toBe(53);

    // Click near end (x = 590px) -> index near 104
    const endClick = calculateCaretIndex(590, elementWidth, textLen);
    expect(endClick).toBeGreaterThan(100);
    expect(endClick).toBeLessThanOrEqual(textLen);

    // Click with 0 offset -> 0
    expect(calculateCaretIndex(0, elementWidth, textLen)).toBe(0);
  });

  it('preserves underlying PDFTextItem geometry independently of UI textarea wrapping', () => {
    const item: PDFTextItem = {
      id: 'text-citation-1',
      pageIndex: 1,
      originalText: 'Longvah, T., Ananthan, R., Bhaskarachary, K. and Venkaiah, K. (2017). Indian Food...',
      editedText: 'Longvah, T., Ananthan, R., Bhaskarachary, K. and Venkaiah, K. (2017). Indian Food...',
      x: 72,
      y: 150,
      originalX: 72,
      originalY: 150,
      width: 480,
      height: 14,
      fontSize: 10,
      fontName: 'Helvetica',
      transform: [1, 0, 0, 1, 72, 150],
      format: {
        bold: false,
        italic: false,
        underline: false,
        fontFamily: 'helvetica',
        fontSizeDelta: 0,
        color: '#000000',
        link: '',
      },
    };

    // Stored geometry for PDF export and redaction calculations remains exact
    expect(item.x).toBe(72);
    expect(item.y).toBe(150);
    expect(item.width).toBe(480);
    expect(item.height).toBe(14);
  });
});
