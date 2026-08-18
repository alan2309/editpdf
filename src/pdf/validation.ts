import { PDF_MAX_FILE_SIZE, IMAGE_MAX_FILE_SIZE } from './pdfConfig';

export const MAX_PDF_SIZE_BYTES = PDF_MAX_FILE_SIZE;
export const MAX_IMAGE_SIZE_BYTES = IMAGE_MAX_FILE_SIZE;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validatePdfFile(file: File, maxSizeBytes = MAX_PDF_SIZE_BYTES): Promise<ValidationResult> {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  if (file.size > maxSizeBytes) {
    const mbLimit = Math.round(maxSizeBytes / (1024 * 1024));
    return { isValid: false, error: `File size exceeds the ${mbLimit} MB limit.` };
  }

  // Check file extension / MIME type
  const isPdfMime = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime) {
    return { isValid: false, error: 'File must be a valid PDF document.' };
  }

  // Inspect first 5 bytes for standard PDF magic header (%PDF-)
  try {
    const slice = file.slice(0, 5);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const header = String.fromCharCode(...bytes);

    if (header !== '%PDF-') {
      return { isValid: false, error: 'File header is not a valid PDF (%PDF- missing).' };
    }
  } catch (err) {
    return { isValid: false, error: 'Failed to read PDF file header.' };
  }

  return { isValid: true };
}

export async function validateImageFile(file: File, maxSizeBytes = MAX_IMAGE_SIZE_BYTES): Promise<ValidationResult> {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  if (file.size > maxSizeBytes) {
    const mbLimit = Math.round(maxSizeBytes / (1024 * 1024));
    return { isValid: false, error: `Image size exceeds the ${mbLimit} MB limit.` };
  }

  const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

  if (!validMimes.includes(file.type) && !validExts.includes(ext)) {
    return { isValid: false, error: 'File must be a JPG, PNG, or WebP image.' };
  }

  return { isValid: true };
}
