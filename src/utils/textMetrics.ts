import type { PDFTextItem } from '../types/pdf';

let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

function getSharedContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedCtx = sharedCanvas.getContext('2d');
  }
  return sharedCtx;
}

export function getFontFamilyString(family: string): string {
  if (family === 'times') return 'Georgia, "Times New Roman", Times, serif';
  if (family === 'courier') return '"Courier New", Courier, monospace';
  return 'Helvetica, Arial, sans-serif';
}

export function calculateSubstringBox(
  item: PDFTextItem,
  matchStart: number,
  matchEnd: number
): { x: number; y: number; width: number; height: number } {
  const text = item.editedText;
  const clampedStart = Math.max(0, Math.min(matchStart, text.length));
  const clampedEnd = Math.max(clampedStart, Math.min(matchEnd, text.length));
  const matchLen = clampedEnd - clampedStart;

  if (text.length === 0 || matchLen === 0) {
    return {
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
    };
  }

  // If the match spans the full text item, return entire item bounds
  if (clampedStart === 0 && clampedEnd === text.length) {
    return {
      x: item.x - 1,
      y: item.y - 1,
      width: item.width + 2,
      height: item.height + 2,
    };
  }

  const ctx = getSharedContext();
  if (ctx) {
    const fontStyle = item.format.italic ? 'italic ' : '';
    const fontWeight = item.format.bold ? 'bold ' : 'normal ';
    const fontSize = Math.max(item.fontSize + item.format.fontSizeDelta, 8);
    const fontFamily = getFontFamilyString(item.format.fontFamily);

    ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${fontFamily}`;

    const textBefore = text.slice(0, clampedStart);
    const matchedText = text.slice(clampedStart, clampedEnd);

    const widthBefore = ctx.measureText(textBefore).width;
    const widthMatched = ctx.measureText(matchedText).width;

    // Estimate scale factor between rendered item width and measured width to handle PDF font kerning
    const totalMeasured = ctx.measureText(text).width;
    const scaleFactor = totalMeasured > 0 ? item.width / totalMeasured : 1;

    const adjustedOffset = widthBefore * scaleFactor;
    const adjustedWidth = Math.max(widthMatched * scaleFactor, 8);

    return {
      x: item.x + adjustedOffset - 1,
      y: item.y - 1,
      width: adjustedWidth + 2,
      height: item.height + 2,
    };
  }

  // Fallback for non-DOM / test environments
  const ratioBefore = clampedStart / text.length;
  const ratioMatch = matchLen / text.length;

  return {
    x: item.x + item.width * ratioBefore - 1,
    y: item.y - 1,
    width: Math.max(item.width * ratioMatch, 8) + 2,
    height: item.height + 2,
  };
}
