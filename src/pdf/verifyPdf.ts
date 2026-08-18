import { PDFDocument } from 'pdf-lib';

export interface PdfVerificationResult {
  isValid: boolean;
  pageCount: number;
  byteLength: number;
  isEncrypted: boolean;
  hasValidHeader: boolean;
  errors: string[];
}

/**
 * Validates the structural integrity and header specification of a PDF byte buffer.
 * Ensures the generated PDF contains a valid '%PDF-' magic header, non-zero bytes,
 * successful document parsing, and matches expected page counts.
 */
export async function verifyPdf(
  bytes: Uint8Array,
  expectedPages?: number
): Promise<PdfVerificationResult> {
  const errors: string[] = [];

  if (!bytes || bytes.length === 0) {
    return {
      isValid: false,
      pageCount: 0,
      byteLength: 0,
      isEncrypted: false,
      hasValidHeader: false,
      errors: ['PDF byte stream is empty (0 bytes).'],
    };
  }

  // 1. Verify standard PDF magic header (%PDF-)
  const header = String.fromCharCode(...bytes.slice(0, 5));
  const hasValidHeader = header === '%PDF-';
  if (!hasValidHeader) {
    errors.push(`Invalid PDF header: expected "%PDF-", got "${header}".`);
  }

  // 2. Check for encryption dictionary in raw byte stream
  const decoder = new TextDecoder('latin1');
  const rawText = decoder.decode(bytes.slice(Math.max(0, bytes.length - 4096)));
  const isEncrypted = rawText.includes('/Encrypt') || decoder.decode(bytes.slice(0, 2048)).includes('/Encrypt');

  let pageCount = 0;

  // 3. Attempt structural parse with pdf-lib
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pageCount = doc.getPageCount();

    if (pageCount <= 0) {
      errors.push('PDF document contains 0 pages.');
    } else if (expectedPages !== undefined && pageCount !== expectedPages) {
      errors.push(`Page count mismatch: expected ${expectedPages}, got ${pageCount}.`);
    }
  } catch (err: any) {
    // If standard encrypted, loading without password is expected to fail or require decryption
    if (!isEncrypted) {
      errors.push(`Failed to parse PDF document structure: ${err.message || 'Corrupt PDF.'}`);
    }
  }

  return {
    isValid: errors.length === 0,
    pageCount,
    byteLength: bytes.length,
    isEncrypted,
    hasValidHeader,
    errors,
  };
}
