/**
 * Triggers a browser download of a Blob and cleanly revokes the object URL.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  if (typeof window === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up memory after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Formats byte size into human readable string (KB, MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Strips the extension from a filename.
 */
export function getBaseFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return fileName;
  return fileName.substring(0, lastDot);
}
