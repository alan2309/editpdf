import { describe, it, expect } from 'vitest';
import { parsePageRanges, parseSplitGroups } from '../src/pdf/pageRangeParser';

describe('pageRangeParser - Strict & Hardened', () => {
  it('parses valid single pages and ranges', () => {
    const res = parsePageRanges('1-5, 8, 10-12', 20);
    expect(res.error).toBeUndefined();
    expect(res.pages).toEqual([1, 2, 3, 4, 5, 8, 10, 11, 12]);
  });

  it('deduplicates and sorts page numbers', () => {
    const res = parsePageRanges('5, 3, 1, 3, 5, 2', 10);
    expect(res.error).toBeUndefined();
    expect(res.pages).toEqual([1, 2, 3, 5]);
  });

  it('strictly rejects non-numeric alpha trailing input like "12abc"', () => {
    const res = parsePageRanges('12abc', 20);
    expect(res.error).toBeDefined();
    expect(res.pages).toHaveLength(0);
  });

  it('strictly rejects decimal numbers like "1.5"', () => {
    const res = parsePageRanges('1.5', 20);
    expect(res.error).toBeDefined();
    expect(res.pages).toHaveLength(0);
  });

  it('strictly rejects invalid zero and negative numbers', () => {
    expect(parsePageRanges('0', 10).error).toBeDefined();
    expect(parsePageRanges('-1', 10).error).toBeDefined();
    expect(parsePageRanges('5-', 10).error).toBeDefined();
    expect(parsePageRanges('-5', 10).error).toBeDefined();
  });

  it('strictly rejects inverted ranges like "10-5"', () => {
    const res = parsePageRanges('10-5', 20);
    expect(res.error).toBeDefined();
    expect(res.pages).toHaveLength(0);
  });

  it('strictly rejects out of bounds pages', () => {
    const res = parsePageRanges('1-15', 10);
    expect(res.error).toBeDefined();
    expect(res.pages).toHaveLength(0);
  });

  it('parses multi-line split groups accurately', () => {
    const multiLineInput = `
      1-3, 5
      6-8
      9, 10
    `;
    const res = parseSplitGroups(multiLineInput, 10);
    expect(res.error).toBeUndefined();
    expect(res.groups).toHaveLength(3);
    expect(res.groups[0]).toEqual([1, 2, 3, 5]);
    expect(res.groups[1]).toEqual([6, 7, 8]);
    expect(res.groups[2]).toEqual([9, 10]);
  });

  it('parses semicolon separated split groups accurately', () => {
    const semicolonInput = '1-2; 3-4; 5';
    const res = parseSplitGroups(semicolonInput, 5);
    expect(res.error).toBeUndefined();
    expect(res.groups).toHaveLength(3);
    expect(res.groups[0]).toEqual([1, 2]);
    expect(res.groups[1]).toEqual([3, 4]);
    expect(res.groups[2]).toEqual([5]);
  });
});
