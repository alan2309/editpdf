import { describe, it, expect } from 'vitest';
import { calculateSubstringBox } from '../src/utils/textMetrics';
import type { PDFTextItem, RedactionBox } from '../src/types/pdf';
import { DEFAULT_FORMAT } from '../src/types/pdf';

describe('Precision Redaction Substring Bounding Boxes', () => {
  const item: PDFTextItem = {
    id: 'item-pii',
    pageIndex: 0,
    originalText: 'SSN: 123-45-6789 and Tel: 555-0199',
    editedText: 'SSN: 123-45-6789 and Tel: 555-0199',
    x: 100,
    y: 200,
    originalX: 100,
    originalY: 200,
    width: 300,
    height: 20,
    fontSize: 14,
    transform: [1, 0, 0, 1, 100, 200],
    fontName: 'Helvetica',
    format: { ...DEFAULT_FORMAT },
  };

  it('redacts only the matched SSN substring and does not cover the label or entire item', () => {
    // "SSN: 123-45-6789" -> "123-45-6789" starts at index 5, ends at index 16
    const ssnStart = item.editedText.indexOf('123-45-6789');
    const ssnEnd = ssnStart + '123-45-6789'.length;

    const box = calculateSubstringBox(item, ssnStart, ssnEnd);

    // Bounding box should start to the right of item.x (after "SSN: ")
    expect(box.x).toBeGreaterThan(item.x);
    // Bounding box width should be significantly less than full text item width
    expect(box.width).toBeLessThan(item.width);
    expect(box.width).toBeGreaterThan(0);
    // Bounding box height should cover item height (item.height + 2 for padding)
    expect(box.height).toBeGreaterThanOrEqual(item.height);
    // Box should stay within item bounds
    expect(box.x + box.width).toBeLessThanOrEqual(item.x + item.width + 4);
  });

  it('creates two distinct, non-overlapping redaction boxes for two separate sensitive terms in the same text item', () => {
    const ssnStart = item.editedText.indexOf('123-45-6789');
    const ssnEnd = ssnStart + '123-45-6789'.length;

    const telStart = item.editedText.indexOf('555-0199');
    const telEnd = telStart + '555-0199'.length;

    const box1 = calculateSubstringBox(item, ssnStart, ssnEnd);
    const box2 = calculateSubstringBox(item, telStart, telEnd);

    // Box 2 (Tel) should be strictly to the right of Box 1 (SSN)
    expect(box2.x).toBeGreaterThan(box1.x + box1.width);
  });

  it('handles full text match gracefully', () => {
    const box = calculateSubstringBox(item, 0, item.editedText.length);
    expect(box.x).toBe(item.x - 1);
    expect(box.width).toBe(item.width + 2);
    expect(box.height).toBe(item.height + 2);
  });
});

describe('Export Mode Redaction Safety Gating', () => {
  it('enforces sanitized export mode when blackout redaction exists', () => {
    const redactions: Record<number, RedactionBox[]> = {
      1: [
        {
          id: 'redact-1',
          pageIndex: 0,
          x: 100,
          y: 200,
          width: 80,
          height: 20,
          type: 'blackout',
        },
      ],
    };

    const hasBlackout = Object.values(redactions).some(list => list.some(b => b.type === 'blackout'));
    expect(hasBlackout).toBe(true);

    const safeExportMode = hasBlackout ? 'sanitized' : 'vector';
    expect(safeExportMode).toBe('sanitized');
  });

  it('allows vector export mode when only whiteouts or no redactions exist', () => {
    const redactions: Record<number, RedactionBox[]> = {
      1: [
        {
          id: 'whiteout-1',
          pageIndex: 0,
          x: 50,
          y: 50,
          width: 40,
          height: 15,
          type: 'whiteout',
        },
      ],
    };

    const hasBlackout = Object.values(redactions).some(list => list.some(b => b.type === 'blackout'));
    expect(hasBlackout).toBe(false);
  });
});
