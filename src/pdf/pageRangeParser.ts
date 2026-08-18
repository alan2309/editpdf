export interface ParseRangeResult {
  pages: number[];
  error?: string;
}

/**
 * Parses a page range string like "1-5, 8, 10-12" into an array of 1-indexed page numbers.
 *
 * @param input The raw input string
 * @param totalPages The total number of pages in the document
 * @param options deduplicate and sort options
 */
export function parsePageRanges(
  input: string,
  totalPages: number,
  options: { deduplicate?: boolean; sort?: boolean } = { deduplicate: true, sort: true }
): ParseRangeResult {
  if (!input || !input.trim()) {
    return { pages: [], error: 'Please specify at least one page or page range.' };
  }

  if (totalPages <= 0) {
    return { pages: [], error: 'Document has no pages.' };
  }

  const rawTokens = input.split(',').map(s => s.trim()).filter(Boolean);
  if (rawTokens.length === 0) {
    return { pages: [], error: 'Please enter valid page numbers or ranges.' };
  }

  const pageList: number[] = [];

  for (const token of rawTokens) {
    // Check if it's a range "X-Y"
    if (token.includes('-')) {
      const parts = token.split('-');
      if (parts.length !== 2) {
        return { pages: [], error: `Invalid range format: "${token}". Expected "start-end".` };
      }

      const start = parseInt(parts[0].trim(), 10);
      const end = parseInt(parts[1].trim(), 10);

      if (isNaN(start) || isNaN(end)) {
        return { pages: [], error: `Invalid numbers in range: "${token}".` };
      }

      if (start < 1) {
        return { pages: [], error: `Page number ${start} is invalid. Page numbers start at 1.` };
      }

      if (end > totalPages) {
        return { pages: [], error: `Page ${end} exceeds total pages in document (${totalPages}).` };
      }

      if (start > end) {
        return { pages: [], error: `Range "${token}" is invalid: start page (${start}) cannot be greater than end page (${end}).` };
      }

      for (let p = start; p <= end; p++) {
        pageList.push(p);
      }
    } else {
      // Single page number
      const pageNum = parseInt(token, 10);
      if (isNaN(pageNum)) {
        return { pages: [], error: `"${token}" is not a valid page number.` };
      }

      if (pageNum < 1) {
        return { pages: [], error: `Page number ${pageNum} is invalid. Page numbers start at 1.` };
      }

      if (pageNum > totalPages) {
        return { pages: [], error: `Page ${pageNum} exceeds total pages in document (${totalPages}).` };
      }

      pageList.push(pageNum);
    }
  }

  let finalPages = pageList;

  if (options.deduplicate) {
    finalPages = Array.from(new Set(finalPages));
  }

  if (options.sort) {
    finalPages.sort((a, b) => a - b);
  }

  return { pages: finalPages };
}

/**
 * Splits a range bundle string like "1-5, 6-10, 11-20" or "1-3; 4-6" into separate page groups.
 */
export function parseSplitGroups(input: string, totalPages: number): { groups: number[][]; error?: string } {
  if (!input || !input.trim()) {
    return { groups: [], error: 'Please enter page ranges to split.' };
  }

  // Allow semicolon or newline or comma between group ranges
  const groupTokens = input.includes(';') ? input.split(';') : input.includes('\n') ? input.split('\n') : input.split(',');
  const groups: number[][] = [];

  for (const groupStr of groupTokens) {
    const trimmed = groupStr.trim();
    if (!trimmed) continue;
    const res = parsePageRanges(trimmed, totalPages, { deduplicate: true, sort: true });
    if (res.error) {
      return { groups: [], error: res.error };
    }
    if (res.pages.length > 0) {
      groups.push(res.pages);
    }
  }

  if (groups.length === 0) {
    return { groups: [], error: 'No valid page ranges found.' };
  }

  return { groups };
}
