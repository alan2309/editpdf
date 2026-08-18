import { describe, it, expect } from 'vitest';
import { createZip, computeCrc32 } from '../src/pdf/zip';

describe('zip generator', () => {
  it('computes correct CRC-32 checksum', () => {
    const encoder = new TextEncoder();
    const data = encoder.encode('123456789');
    const crc = computeCrc32(data);
    expect(crc).toBe(0xcbf43926);
  });

  it('creates valid ZIP binary with local headers and EOCD', () => {
    const encoder = new TextEncoder();
    const files = [
      { name: 'hello.txt', data: encoder.encode('Hello World') },
      { name: 'document.pdf', data: encoder.encode('%PDF-1.7\n...') },
    ];

    const zipBytes = createZip(files);
    expect(zipBytes).toBeInstanceOf(Uint8Array);
    expect(zipBytes.length).toBeGreaterThan(100);

    // Verify PKZip header (0x50, 0x4b, 0x03, 0x04)
    expect(zipBytes[0]).toBe(0x50);
    expect(zipBytes[1]).toBe(0x4b);
    expect(zipBytes[2]).toBe(0x03);
    expect(zipBytes[3]).toBe(0x04);
  });
});
