import { describe, it, expect } from 'vitest';
import { validateImageFile } from '../src/utils/imageValidation';

describe('Image and File Validation', () => {
  it('rejects files larger than 5MB', async () => {
    // Create mock 6MB file
    const oversizedBuffer = new Uint8Array(6 * 1024 * 1024);
    const oversizedFile = new File([oversizedBuffer], 'large-photo.png', { type: 'image/png' });

    const result = await validateImageFile(oversizedFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5 MB');
  });

  it('rejects unsupported MIME types (e.g. SVG or executable)', async () => {
    const invalidFile = new File(['<svg></svg>'], 'image.svg', { type: 'image/svg+xml' });
    const result = await validateImageFile(invalidFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported image format');
  });
});
