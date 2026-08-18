import { describe, it, expect } from 'vitest';
import type { PDFTextItem, SearchMatch } from '../src/types/pdf';
import { DEFAULT_FORMAT } from '../src/types/pdf';

function searchInItems(
  items: PDFTextItem[],
  query: string,
  matchCase: boolean,
  wholeWord: boolean,
  pageNumber = 1
): SearchMatch[] {
  if (!query) return [];

  const results: SearchMatch[] = [];
  const flags = matchCase ? 'g' : 'gi';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = wholeWord ? `\\b${escaped}\\b` : escaped;

  for (const it of items) {
    if (it.isDeleted) continue;
    const text = it.editedText;
    const regex = new RegExp(regexPattern, flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      results.push({
        itemId: it.id,
        pageNumber,
        originalText: it.originalText,
        matchedText: match[0],
        matchStart: match.index,
        matchEnd: match.index + match[0].length,
        query,
        matchCase,
        wholeWord,
      });

      if (regex.lastIndex === match.index) {
        regex.lastIndex++;
      }
    }
  }

  return results;
}

function applyReplaceCurrent(
  text: string,
  match: SearchMatch,
  replacement: string
): string {
  // 1. Direct character slice if offsets are valid and text matches
  if (
    match.matchStart >= 0 &&
    match.matchEnd <= text.length
  ) {
    const sliceCandidate = text.slice(match.matchStart, match.matchEnd);
    const candidateMatches = match.matchCase
      ? sliceCandidate === match.query
      : sliceCandidate.toLowerCase() === match.query.toLowerCase();

    if (candidateMatches) {
      const before = text.slice(0, match.matchStart);
      const after = text.slice(match.matchEnd);
      return before + replacement + after;
    }
  }

  // 2. Fallback: Search first exact regex match in current text and replace only that occurrence
  const flags = match.matchCase ? '' : 'i';
  const escaped = match.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(match.wholeWord ? `\\b${escaped}\\b` : escaped, flags);
  const matchResult = regex.exec(text);

  if (matchResult) {
    const idx = matchResult.index;
    const len = matchResult[0].length;
    const before = text.slice(0, idx);
    const after = text.slice(idx + len);
    return before + replacement + after;
  }

  return text;
}

function applyReplaceAll(
  text: string,
  query: string,
  replacement: string,
  matchCase: boolean,
  wholeWord: boolean
): string {
  const flags = matchCase ? 'g' : 'gi';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = wholeWord ? `\\b${escaped}\\b` : escaped;
  const regex = new RegExp(regexPattern, flags);
  return text.replace(regex, replacement);
}

describe('Search Engine Exact Matching', () => {
  const sampleItems: PDFTextItem[] = [
    {
      id: 'item-1',
      pageIndex: 0,
      originalText: 'Customer Name: John Smith',
      editedText: 'Customer Name: John Smith',
      x: 50,
      y: 100,
      originalX: 50,
      originalY: 100,
      width: 200,
      height: 20,
      fontSize: 14,
      transform: [1, 0, 0, 1, 50, 100],
      fontName: 'Helvetica',
      format: { ...DEFAULT_FORMAT },
    },
    {
      id: 'item-2',
      pageIndex: 0,
      originalText: 'Account balance is ₹50,000 for Johnathan Johnson',
      editedText: 'Account balance is ₹50,000 for Johnathan Johnson',
      x: 50,
      y: 130,
      originalX: 50,
      originalY: 130,
      width: 350,
      height: 20,
      fontSize: 14,
      transform: [1, 0, 0, 1, 50, 130],
      fontName: 'Helvetica',
      format: { ...DEFAULT_FORMAT },
    },
  ];

  it('calculates exact substring character offsets for search matches', () => {
    const matches = searchInItems(sampleItems, 'John', true, false);
    expect(matches.length).toBe(3);

    // First match in "Customer Name: John Smith"
    expect(matches[0].matchedText).toBe('John');
    expect(matches[0].matchStart).toBe(15);
    expect(matches[0].matchEnd).toBe(19);
    expect(sampleItems[0].editedText.slice(matches[0].matchStart, matches[0].matchEnd)).toBe('John');
  });

  it('respects Match Case setting', () => {
    const lowerMatches = searchInItems(sampleItems, 'john', true, false);
    expect(lowerMatches.length).toBe(0);

    const insensitiveMatches = searchInItems(sampleItems, 'john', false, false);
    expect(insensitiveMatches.length).toBe(3);
  });

  it('respects Whole Word setting', () => {
    // "John" as whole word should match "John" in item-1, but not "Johnathan" or "Johnson" in item-2
    const wholeWordMatches = searchInItems(sampleItems, 'John', true, true);
    expect(wholeWordMatches.length).toBe(1);
    expect(wholeWordMatches[0].itemId).toBe('item-1');
  });

  it('supports Unicode and currency symbols', () => {
    const unicodeMatches = searchInItems(sampleItems, '₹50,000', true, false);
    expect(unicodeMatches.length).toBe(1);
    expect(unicodeMatches[0].matchedText).toBe('₹50,000');
  });
});

describe('Replace Current Substring Semantics', () => {
  it('replaces only the matched substring without replacing the whole text item', () => {
    const original = 'Customer Name: John Smith';
    const match: SearchMatch = {
      itemId: 'item-1',
      pageNumber: 1,
      originalText: original,
      matchedText: 'John',
      matchStart: 15,
      matchEnd: 19,
      query: 'John',
      matchCase: true,
      wholeWord: true,
    };

    const result = applyReplaceCurrent(original, match, 'David');
    expect(result).toBe('Customer Name: David Smith');
  });

  it('handles empty replacement string correctly', () => {
    const original = 'Customer Name: John Smith';
    const match: SearchMatch = {
      itemId: 'item-1',
      pageNumber: 1,
      originalText: original,
      matchedText: 'John ',
      matchStart: 15,
      matchEnd: 20,
      query: 'John ',
      matchCase: true,
      wholeWord: false,
    };

    const result = applyReplaceCurrent(original, match, '');
    expect(result).toBe('Customer Name: Smith');
  });

  it('handles longer replacement string correctly', () => {
    const original = 'ID: 1';
    const match: SearchMatch = {
      itemId: 'item-1',
      pageNumber: 1,
      originalText: original,
      matchedText: '1',
      matchStart: 4,
      matchEnd: 5,
      query: '1',
      matchCase: true,
      wholeWord: true,
    };

    const result = applyReplaceCurrent(original, match, 'REF-99882244');
    expect(result).toBe('ID: REF-99882244');
  });
});

describe('Replace All Multi-Occurrence & Loop Prevention', () => {
  it('prevents infinite recursion when replacement contains search term', () => {
    const text = 'John and John went to work';
    // If replacement is "John Smith", it must not recursively replace the new "John" in "John Smith"
    const result = applyReplaceAll(text, 'John', 'John Smith', true, true);
    expect(result).toBe('John Smith and John Smith went to work');
  });

  it('replaces all matching whole word occurrences', () => {
    const text = 'cat concat cat category cat';
    const result = applyReplaceAll(text, 'cat', 'dog', true, true);
    expect(result).toBe('dog concat dog category dog');
  });
});
