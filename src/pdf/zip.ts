/**
 * Lightweight, zero-dependency pure TypeScript ZIP generator.
 * Creates standard PKZip uncompressed (Store) archives in browser and Node.js.
 */

// CRC-32 Lookup Table
const crcTable: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function computeCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileInput {
  name: string;
  data: Uint8Array;
}

export function createZip(files: ZipFileInput[]): Uint8Array {
  const encoder = new TextEncoder();
  const fileEntries: {
    nameBytes: Uint8Array;
    data: Uint8Array;
    crc32: number;
    offset: number;
  }[] = [];

  let currentOffset = 0;
  const localHeaderChunks: Uint8Array[] = [];

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = computeCrc32(file.data);

    // Local file header (30 bytes + filename + data)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true);         // Version needed to extract (2.0)
    view.setUint16(6, 0, true);          // General purpose bit flag
    view.setUint16(8, 0, true);          // Compression method (0 = store)
    view.setUint16(10, 0, true);         // Last mod file time
    view.setUint16(12, 0, true);         // Last mod file date
    view.setUint32(14, crc, true);       // CRC-32
    view.setUint32(18, file.data.length, true); // Compressed size
    view.setUint32(22, file.data.length, true); // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // Filename length
    view.setUint16(28, 0, true);         // Extra field length

    localHeader.set(nameBytes, 30);

    fileEntries.push({
      nameBytes,
      data: file.data,
      crc32: crc,
      offset: currentOffset,
    });

    localHeaderChunks.push(localHeader);
    localHeaderChunks.push(file.data);

    currentOffset += localHeader.length + file.data.length;
  }

  const centralDirStartOffset = currentOffset;
  const centralDirChunks: Uint8Array[] = [];

  for (const entry of fileEntries) {
    // Central directory header (46 bytes + filename)
    const cdHeader = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(cdHeader.buffer);

    view.setUint32(0, 0x02014b50, true); // Central file header signature
    view.setUint16(4, 20, true);         // Version made by
    view.setUint16(6, 20, true);         // Version needed to extract
    view.setUint16(8, 0, true);          // General purpose bit flag
    view.setUint16(10, 0, true);         // Compression method (0 = store)
    view.setUint16(12, 0, true);         // Last mod file time
    view.setUint16(14, 0, true);         // Last mod file date
    view.setUint32(16, entry.crc32, true); // CRC-32
    view.setUint32(20, entry.data.length, true); // Compressed size
    view.setUint32(24, entry.data.length, true); // Uncompressed size
    view.setUint16(28, entry.nameBytes.length, true); // Filename length
    view.setUint16(30, 0, true);         // Extra field length
    view.setUint16(32, 0, true);         // File comment length
    view.setUint16(34, 0, true);         // Disk number start
    view.setUint16(36, 0, true);         // Internal file attributes
    view.setUint32(38, 0, true);         // External file attributes
    view.setUint32(42, entry.offset, true); // Relative offset of local header

    cdHeader.set(entry.nameBytes, 46);
    centralDirChunks.push(cdHeader);
    currentOffset += cdHeader.length;
  }

  const centralDirLength = currentOffset - centralDirStartOffset;

  // End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true);          // Number of this disk
  eocdView.setUint16(6, 0, true);          // Disk where central directory starts
  eocdView.setUint16(8, fileEntries.length, true);  // Number of central directory records on this disk
  eocdView.setUint16(10, fileEntries.length, true); // Total number of central directory records
  eocdView.setUint32(12, centralDirLength, true);   // Size of central directory
  eocdView.setUint32(16, centralDirStartOffset, true); // Offset of start of central directory
  eocdView.setUint16(20, 0, true);         // Comment length

  // Combine all parts into single Uint8Array
  const totalLength = currentOffset + eocd.length;
  const result = new Uint8Array(totalLength);

  let pos = 0;
  for (const chunk of localHeaderChunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  for (const chunk of centralDirChunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  result.set(eocd, pos);

  return result;
}
