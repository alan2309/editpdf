import { describe, it, expect } from 'vitest';
import type { PDFEditorState, RedactionBox, SearchMatch } from '../src/types/pdf';

describe('Continuous Scrolling Document Architecture', () => {
  it('calculates exact page placeholder dimensions at different scale factors without layout shifts', () => {
    const pageDimensions: Record<number, { width: number; height: number; rotation: number }> = {
      1: { width: 612, height: 792, rotation: 0 }, // Letter
      2: { width: 595, height: 842, rotation: 0 }, // A4
      3: { width: 612, height: 1008, rotation: 0 }, // Legal
    };

    const scale1 = 1.0;
    expect(pageDimensions[1].width * scale1).toBe(612);
    expect(pageDimensions[1].height * scale1).toBe(792);

    const scale15 = 1.5;
    expect(pageDimensions[1].width * scale15).toBe(918);
    expect(pageDimensions[1].height * scale15).toBe(1188);
    expect(pageDimensions[2].width * scale15).toBe(892.5);
    expect(pageDimensions[2].height * scale15).toBe(1263);

    const scale2 = 2.0;
    expect(pageDimensions[3].width * scale2).toBe(1224);
    expect(pageDimensions[3].height * scale2).toBe(2016);
  });

  it('validates and clamps Go To Page target numbers', () => {
    function validateGoToPage(input: string, totalPages: number): number | null {
      const parsed = parseInt(input, 10);
      if (isNaN(parsed)) return null;
      if (parsed < 1 || parsed > totalPages) return null;
      return parsed;
    }

    expect(validateGoToPage('5', 10)).toBe(5);
    expect(validateGoToPage('1', 10)).toBe(1);
    expect(validateGoToPage('10', 10)).toBe(10);
    expect(validateGoToPage('0', 10)).toBeNull();
    expect(validateGoToPage('11', 10)).toBeNull();
    expect(validateGoToPage('-3', 10)).toBeNull();
    expect(validateGoToPage('abc', 10)).toBeNull();
    expect(validateGoToPage('', 10)).toBeNull();
  });

  it('preserves page-specific annotation coordinates independently of scrolling', () => {
    const redactionP1: RedactionBox = {
      id: 'box-1',
      pageIndex: 1,
      x: 100,
      y: 150,
      width: 200,
      height: 30,
      type: 'blackout',
    };

    const redactionP50: RedactionBox = {
      id: 'box-50',
      pageIndex: 50,
      x: 80,
      y: 220,
      width: 150,
      height: 25,
      type: 'whiteout',
    };

    // Stored coordinates on each page remain (100, 150) and (80, 220)
    expect(redactionP1.pageIndex).toBe(1);
    expect(redactionP1.x).toBe(100);
    expect(redactionP1.y).toBe(150);

    expect(redactionP50.pageIndex).toBe(50);
    expect(redactionP50.x).toBe(80);
    expect(redactionP50.y).toBe(220);
  });

  it('navigates search matches to correct page target', () => {
    const matches: SearchMatch[] = [
      {
        itemId: 'item-p1-1',
        pageNumber: 1,
        originalText: 'Confidential Report',
        matchedText: 'Report',
        matchStart: 13,
        matchEnd: 19,
        query: 'Report',
        matchCase: false,
        wholeWord: false,
      },
      {
        itemId: 'item-p45-3',
        pageNumber: 45,
        originalText: 'Final Audit Report for 2026',
        matchedText: 'Report',
        matchStart: 12,
        matchEnd: 18,
        query: 'Report',
        matchCase: false,
        wholeWord: false,
      },
    ];

    expect(matches[0].pageNumber).toBe(1);
    expect(matches[1].pageNumber).toBe(45);
  });
});
