export { PdfError, PdfPasswordError } from 'pdfstudio';

export class QpdfValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QpdfValidationError';
  }
}
