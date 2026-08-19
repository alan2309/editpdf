import { getQpdfToolkit } from './qpdfLoader';
import type {
  PdfInput,
  MergeSource,
  SplitOptions,
  ExtractPagesOptions,
  DeletePagesOptions,
  RotateOptions,
  LockOptions,
  UnlockOptions,
  CompressOptions,
  FlattenOptions,
  PdfInfo,
} from './qpdfTypes';
import { QpdfValidationError } from './qpdfErrors';

/**
 * Structure-preserving PDF operations layer powered by QPDF compiled to WebAssembly.
 * Guarantees zero document reconstruction distortion: preserves fonts, vector streams,
 * MediaBox/CropBox/BleedBox/TrimBox/ArtBox page boxes, annotations, links, and forms.
 */
export class QpdfEngine {
  /**
   * Merges multiple PDF inputs or specific page selections from inputs into a single PDF.
   */
  static async mergePdfs(sources: ReadonlyArray<PdfInput | MergeSource>): Promise<Uint8Array> {
    if (!sources || sources.length === 0) {
      throw new QpdfValidationError('Merge requires at least one source document.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.merge(sources);
  }

  /**
   * Splits a PDF into multiple documents of `pagesPerFile` pages each (default 1).
   */
  static async splitPdf(pdf: PdfInput, options?: SplitOptions): Promise<Uint8Array[]> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided for split.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.split(pdf, options);
  }

  /**
   * Extracts a specific page selection into a new document.
   */
  static async extractPages(pdf: PdfInput, options: ExtractPagesOptions): Promise<Uint8Array> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided for extract.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.extractPages(pdf, options);
  }

  /**
   * Deletes a specific page selection from a document, keeping all other pages.
   */
  static async deletePages(pdf: PdfInput, options: DeletePagesOptions): Promise<Uint8Array> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided for page deletion.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.deletePages(pdf, options);
  }

  /**
   * Reorders pages according to an exact array of 1-indexed page numbers.
   */
  static async reorderPages(pdf: PdfInput, newPageOrder: number[]): Promise<Uint8Array> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided for reorder.');
    }
    if (!newPageOrder || newPageOrder.length === 0) {
      throw new QpdfValidationError('No page order provided.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.extractPages(pdf, { pages: newPageOrder });
  }

  /**
   * Rotates pages relative to their current orientation or to an absolute rotation.
   */
  static async rotatePages(pdf: PdfInput, options: RotateOptions): Promise<Uint8Array> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided for rotation.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.rotate(pdf, options);
  }

  /**
   * Encrypts a PDF with standard AES-256 (or AES-128) encryption and granular security permissions.
   */
  static async protectPdf(pdf: PdfInput, options: LockOptions): Promise<Uint8Array> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided for protection.');
    }
    if (!options.userPassword && !options.ownerPassword) {
      throw new QpdfValidationError('Password is required to protect PDF.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.lock(pdf, options);
  }

  /**
   * Decrypts a password-protected PDF.
   */
  static async unlockPdf(pdf: PdfInput, options: UnlockOptions): Promise<Uint8Array> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided for unlock.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.unlock(pdf, options);
  }

  /**
   * Shrinks a PDF by recompressing streams with Flate level 9 and packing objects into object streams.
   * Strictly lossless: vector semantics, fonts, and images are preserved.
   */
  static async compressPdf(pdf: PdfInput, options?: CompressOptions): Promise<Uint8Array> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided for compression.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.compress(pdf, options);
  }

  /**
   * Structurally flattens annotations and form fields into page content.
   */
  static async flattenPdf(pdf: PdfInput, options?: FlattenOptions): Promise<Uint8Array> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided for flattening.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.flatten(pdf, options);
  }

  /**
   * Retrieves the authoritative page count of a PDF.
   */
  static async getPageCount(pdf: PdfInput, options?: { password?: string }): Promise<number> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.pageCount(pdf, options);
  }

  /**
   * Checks if a PDF document is encrypted.
   */
  static async isEncrypted(pdf: PdfInput): Promise<boolean> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.isEncrypted(pdf);
  }

  /**
   * Checks if a document requires a password to open.
   */
  static async requiresPassword(pdf: PdfInput): Promise<boolean> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.requiresPassword(pdf);
  }

  /**
   * Inspects detailed document metadata, version, encryption info, and attachments.
   */
  static async getInfo(pdf: PdfInput, options?: { password?: string }): Promise<PdfInfo> {
    if (!pdf) {
      throw new QpdfValidationError('No PDF input provided.');
    }
    const toolkit = await getQpdfToolkit();
    return toolkit.getInfo(pdf, options);
  }
}
