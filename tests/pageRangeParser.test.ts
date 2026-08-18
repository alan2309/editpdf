import { describe, it, expect } from 'vitest';
import { parsePageRanges, parseSplitGroups } from '../src/pdf/pageRangeParser';

describe('pageRangeParser', () => {
  it('parses single page numbers', () => {
    const res = parsePageRanges('1, 3, 5', 10);
    expect(res.error).toBeUndefined();
    expect(res.pages).toEqual([1, 3, 5]);
  });

  it('parses continuous ranges', () => {
    const res = parsePageRanges('1-5', 10);
    expect(res.error).toBeUndefined();
    expect(res.pages).toEqual([1, 2, 3, 4, 5]);
  });

  it('parses mixed ranges and single numbers with deduplication', () => {
    const res = parsePageRanges('1-3, 2, 8, 10-12, 1', 15);
    expect(res.error).toBeUndefined();
    expect(res.pages).toEqual([1, 2, 3, 8, 10, 11, 12]);
  });

  it('returns error when page exceeds total pages', () => {
    const res = parsePageRanges('1-5, 12', 10);
    expect(res.error).toContain('exceeds total pages');
  });

  it('returns error for invalid range bounds', () => {
    const res = parsePageRanges('5-2', 10);
    expect(res.error).toContain('start page (5) cannot be greater than end page (2)');
  });

  it('returns error for non-numeric input', () => {
    const res = parsePageRanges('abc, 1-2', 10);
    expect(res.error).toBeDefined();
  });

  it('parses split groups correctly', () => {
    const res = parseSplitGroups('1-3, 4-6, 7-10', 10);
    expect(res.error).toBeUndefined();
    expect(res.groups).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9, 10],
    ]);
  });
});
