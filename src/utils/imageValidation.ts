export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  dataUrl?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 4096;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type || 'unknown'}). Please upload a PNG, JPEG, or WebP image.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB.`,
    };
  }

  return new Promise<ImageValidationResult>(resolve => {
    const reader = new FileReader();

    reader.onerror = () => {
      resolve({ valid: false, error: 'Failed to read image file. The file may be corrupt.' });
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();

      img.onerror = () => {
        resolve({ valid: false, error: 'Failed to decode image data. The image file is corrupt or invalid.' });
      };

      img.onload = () => {
        if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
          resolve({
            valid: false,
            error: `Image dimensions (${img.width}x${img.height}) exceed maximum allowed dimensions of ${MAX_DIMENSION}x${MAX_DIMENSION}px.`,
          });
          return;
        }

        if (img.width < 5 || img.height < 5) {
          resolve({
            valid: false,
            error: 'Image is too small to be used as a signature or stamp.',
          });
          return;
        }

        resolve({
          valid: true,
          width: img.width,
          height: img.height,
          dataUrl,
        });
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
