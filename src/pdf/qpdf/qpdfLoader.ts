import { createPdfToolkit, type PdfToolkit } from 'pdfstudio';

let toolkitPromise: Promise<PdfToolkit> | null = null;

/**
 * Returns a shared singleton instance of the QPDF WASM toolkit.
 * Loads and compiles the WebAssembly binary only once on initial call.
 */
export async function getQpdfToolkit(): Promise<PdfToolkit> {
  if (!toolkitPromise) {
    const isBrowser = typeof window !== 'undefined';
    toolkitPromise = createPdfToolkit(
      isBrowser ? { wasmUrl: '/qpdf.wasm' } : undefined
    );
  }
  return toolkitPromise;
}

/**
 * Resets the toolkit singleton instance (primarily for isolated test environments if needed).
 */
export function resetQpdfToolkit(): void {
  toolkitPromise = null;
}
