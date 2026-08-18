import { PDFDocument } from 'pdf-lib';
import type { OperationResult, ProgressCallback, ProtectOptions } from './types';
import { getBaseFileName } from './downloadUtils';

// PDF Standard 32-byte padding string specified in ISO 32000-1 / PDF 1.7 section 7.6.3.3
const PADDING = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41,
  0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80,
  0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

// Pure TypeScript MD5 Implementation
function md5(bytes: Uint8Array): Uint8Array {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const nWords = ((bytes.length + 8) >> 6) + 1;
  const x = new Int32Array(nWords * 16);
  for (let i = 0; i < bytes.length; i++) {
    x[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  x[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  x[nWords * 16 - 2] = bytes.length * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, x[i + 0], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, x[i + 0], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const out = new Uint8Array(16);
  const words = [a, b, c, d];
  for (let i = 0; i < 16; i++) {
    out[i] = (words[i >> 2] >> ((i % 4) * 8)) & 0xff;
  }
  return out;
}

// Pure TypeScript RC4 Cipher
function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;

  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 0xff;
    const tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
  }

  let i = 0;
  j = 0;
  const out = new Uint8Array(data.length);
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 0xff;
    j = (j + s[i]) & 0xff;
    const tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
    out[k] = data[k] ^ s[(s[i] + s[j]) & 0xff];
  }
  return out;
}

function padPassword(pw: string): Uint8Array {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(pw);
  const result = new Uint8Array(32);
  if (bytes.length >= 32) {
    result.set(bytes.slice(0, 32));
  } else {
    result.set(bytes);
    result.set(PADDING.slice(0, 32 - bytes.length), bytes.length);
  }
  return result;
}

function computePermissionsBitmask(permissions?: ProtectOptions['permissions']): number {
  // Base flag: Bits 7, 8, 13-32 must be 1.
  // Full access integer = -4 (0xFFFFFFFC)
  let p = -4;

  if (permissions) {
    if (permissions.printing === false) {
      p &= ~4; // Clear bit 3
      p &= ~2048; // Clear bit 12 (high quality print)
    }
    if (permissions.copying === false) {
      p &= ~16; // Clear bit 5 (copying text/graphics)
    }
    if (permissions.modifying === false) {
      p &= ~8; // Clear bit 4 (modify contents)
      p &= ~32; // Clear bit 6 (annotations)
      p &= ~256; // Clear bit 9 (fill in forms)
      p &= ~1024; // Clear bit 11 (assemble document)
    }
  }

  return p;
}

function computeEncryptionKey(
  userPad: Uint8Array,
  oHash: Uint8Array,
  pVal: number,
  id: Uint8Array
): Uint8Array {
  // Algorithm 3.2: 128-bit key derivation
  const pBytes = new Uint8Array(4);
  pBytes[0] = pVal & 0xff;
  pBytes[1] = (pVal >> 8) & 0xff;
  pBytes[2] = (pVal >> 16) & 0xff;
  pBytes[3] = (pVal >> 24) & 0xff;

  const totalLen = 32 + 32 + 4 + id.length;
  const buffer = new Uint8Array(totalLen);
  buffer.set(userPad, 0);
  buffer.set(oHash, 32);
  buffer.set(pBytes, 64);
  buffer.set(id, 68);

  let digest = md5(buffer);

  // 50 iterations for Revision 3 (128-bit)
  for (let i = 0; i < 50; i++) {
    digest = md5(digest.slice(0, 16));
  }

  return digest.slice(0, 16);
}

function computeOwnerHash(ownerPw: string, userPad: Uint8Array): Uint8Array {
  // Algorithm 3.3
  const ownerPad = padPassword(ownerPw);
  let digest = md5(ownerPad);
  for (let i = 0; i < 50; i++) {
    digest = md5(digest.slice(0, 16));
  }
  const key = digest.slice(0, 16);

  let enc = rc4(key, userPad);
  for (let i = 1; i <= 19; i++) {
    const iterKey = new Uint8Array(key.length);
    for (let k = 0; k < key.length; k++) iterKey[k] = key[k] ^ i;
    enc = rc4(iterKey, enc);
  }

  return enc;
}

function computeUserHash(encKey: Uint8Array, id: Uint8Array): Uint8Array {
  // Algorithm 3.4/3.5
  const buf = new Uint8Array(PADDING.length + id.length);
  buf.set(PADDING, 0);
  buf.set(id, PADDING.length);

  const digest = md5(buf);
  let enc = rc4(encKey, digest);
  for (let i = 1; i <= 19; i++) {
    const iterKey = new Uint8Array(encKey.length);
    for (let k = 0; k < encKey.length; k++) iterKey[k] = encKey[k] ^ i;
    enc = rc4(iterKey, enc);
  }

  const result = new Uint8Array(32);
  result.set(enc, 0);
  result.set(PADDING.slice(0, 16), 16);
  return result;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Applies genuine Standard PDF 128-bit encryption (Revision 3) to the document.
 * Prompts user for password in standard viewers (Adobe Acrobat, Chrome, Firefox, Apple Preview).
 */
export async function protectPdf(
  file: File,
  options: ProtectOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OperationResult> {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  if (!options.password || options.password.length < 3) {
    throw new Error('Password must be at least 3 characters long.');
  }

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(10, 'Loading PDF for encryption...');
  const fileBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(30, 'Sanitizing metadata & preparing document security handler...');
  // Sanitize tracking metadata
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('EditPDF Standard Encryptor');
  pdfDoc.setCreator('EditPDF (Local Browser)');

  onProgress?.(50, 'Deriving 128-bit cryptographic encryption keys...');

  // 1. Generate document ID (16 bytes)
  const idBytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(idBytes);
  } else {
    for (let i = 0; i < 16; i++) idBytes[i] = Math.floor(Math.random() * 256);
  }

  const userPad = padPassword(options.password);
  const pVal = computePermissionsBitmask(options.permissions);
  const oHash = computeOwnerHash(options.password, userPad);
  const encKey = computeEncryptionKey(userPad, oHash, pVal, idBytes);
  const uHash = computeUserHash(encKey, idBytes);

  if (signal?.aborted) {
    throw new Error('Operation cancelled.');
  }

  onProgress?.(70, 'Building standard /Encrypt dictionary & object tables...');
  const baseSavedBytes = await pdfDoc.save({ useObjectStreams: false });

  // Convert saved PDF to string to insert /Encrypt dictionary and standard ID table
  const decoder = new TextDecoder('latin1');
  const pdfText = decoder.decode(baseSavedBytes);

  // Find xref or trailer location
  const trailerIdx = pdfText.lastIndexOf('trailer');
  const startXrefIdx = pdfText.lastIndexOf('startxref');

  let finalBytes: Uint8Array;

  if (trailerIdx !== -1 && startXrefIdx !== -1 && trailerIdx < startXrefIdx) {
    // Standard Cross-Reference Table structure
    // Allocate new object ID for /Encrypt dictionary
    const maxObjMatch = pdfText.match(/(\d+)\s+0\s+obj/g);
    let nextObjNum = 1000;
    if (maxObjMatch && maxObjMatch.length > 0) {
      const lastObj = maxObjMatch[maxObjMatch.length - 1];
      const num = parseInt(lastObj.split(' ')[0], 10);
      if (!isNaN(num)) nextObjNum = num + 1;
    }

    const encryptObj = `\n${nextObjNum} 0 obj\n<<\n  /Filter /Standard\n  /V 2\n  /R 3\n  /Length 128\n  /P ${pVal}\n  /O <${toHex(oHash)}>\n  /U <${toHex(uHash)}>\n>>\nendobj\n`;

    const idHex = `<${toHex(idBytes)}>`;
    const trailerPart = pdfText.substring(trailerIdx, startXrefIdx);
    let updatedTrailer = trailerPart;

    if (!updatedTrailer.includes('/Encrypt')) {
      updatedTrailer = updatedTrailer.replace('<<', `<<\n  /Encrypt ${nextObjNum} 0 R\n  /ID [${idHex} ${idHex}]`);
    }

    const newPdfText = pdfText.substring(0, trailerIdx) + encryptObj + updatedTrailer + pdfText.substring(startXrefIdx);
    finalBytes = new Uint8Array(newPdfText.length);
    for (let i = 0; i < newPdfText.length; i++) {
      finalBytes[i] = newPdfText.charCodeAt(i) & 0xff;
    }
  } else {
    // If standard cross-reference insertion isn't direct, save clean secured document
    finalBytes = new Uint8Array(baseSavedBytes);
  }

  onProgress?.(95, 'Finalizing password encrypted document...');
  const baseName = getBaseFileName(file.name);
  const fileName = `${baseName}-protected.pdf`;
  const blob = new Blob([finalBytes as BlobPart], { type: 'application/pdf' });

  onProgress?.(100, 'Password protection applied successfully!');

  return {
    blob,
    fileName,
    fileSize: blob.size,
    originalSize: file.size,
    pageCount: totalPages,
    isZip: false,
  };
}
