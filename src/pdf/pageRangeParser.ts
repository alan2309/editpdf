export interface ParseRangeResult {
  pages: number[];
  error?: string;
}

const SINGLE_PAGE_REGEX = /^\d+$/;
const PAGE_RANGE_REGEX = /^(\d+)\s*-\s*(\d+)$/;

/**
 * Parses a page range string like "1-5, 8, 10-12" into an array of 1-indexed page numbers.
 * Enforces strict syntax checking to prevent malformed numeric inputs (e.g., '12abc', '1.5', '0', '-5').
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
    // Check if it matches strict range "X-Y"
    const rangeMatch = token.match(PAGE_RANGE_REGEX);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);

      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return { pages: [], error: `Invalid range format: "${token}".` };
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
      continue;
    }

    // Check if it matches strict single page integer "X"
    if (SINGLE_PAGE_REGEX.test(token)) {
      const pageNum = Number(token);

      if (pageNum < 1) {
        return { pages: [], error: `Page number ${pageNum} is invalid. Page numbers start at 1.` };
      }

      if (pageNum > totalPages) {
        return { pages: [], error: `Page ${pageNum} exceeds total pages in document (${totalPages}).` };
      }

      pageList.push(pageNum);
      continue;
    }

    // Otherwise it is malformed (e.g., '12abc', '1.5', '1foo-5', '-5', '5-')
    return { pages: [], error: `Invalid page specification: "${token}". Expected a positive number or range (e.g. 1-5).` };
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
 * Splits multi-group definitions (one per line, or separated by semicolons)
 * Example input:
 *   1-5, 8
 *   10-15
 *   20
 * Produces groups: [[1,2,3,4,5,8], [10,11,12,13,14,15], [20]]
 */
export function parseSplitGroups(input: string, totalPages: number): { groups: number[][]; error?: string } {
  if (!input || !input.trim()) {
    return { groups: [], error: 'Please enter page ranges to split.' };
  }

  // Split by newlines or semicolons first
  const groupTokens = input.includes('\n')
    ? input.split('\n')
    : input.includes(';')
    ? input.split(';')
    : [input];

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
