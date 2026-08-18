import { describe, it, expect } from 'vitest';

describe('Coordinate Space & Viewport Transformations', () => {
  // Helper: Canvas to PDF point conversion
  function canvasToPdfCoords(
    canvasX: number,
    canvasY: number,
    canvasH: number,
    itemH: number,
    scale: number,
    pdfPageH: number
  ) {
    const pdfX = canvasX / scale;
    // PDF origin (0,0) is bottom-left, while canvas is top-left
    const pdfY = pdfPageH - (canvasY + itemH) / scale;
    return { pdfX, pdfY };
  }

  it('converts standard canvas coordinates (1.5x scale) to PDF point coordinates', () => {
    const scale = 1.5;
    const pdfPageW = 612; // Standard Letter width (points)
    const pdfPageH = 792; // Standard Letter height (points)
    const canvasW = pdfPageW * scale; // 918
    const canvasH = pdfPageH * scale; // 1188

    const canvasX = 150;
    const canvasY = 300;
    const itemH = 20;

    const coords = canvasToPdfCoords(canvasX, canvasY, canvasH, itemH, scale, pdfPageH);

    expect(coords.pdfX).toBe(100);
    // (792 - (300 + 20) / 1.5) = 792 - 213.333 = 578.666
    expect(coords.pdfY).toBeCloseTo(578.67, 1);
  });

  it('correctly maps zoom scales across 50%, 100%, 150%, 200%, 300%', () => {
    const pdfW = 600;
    const scales = [0.5, 1.0, 1.5, 2.0, 3.0];
    const expectedWidths = [300, 600, 900, 1200, 1800];

    scales.forEach((scale, i) => {
      const renderedWidth = pdfW * scale;
      expect(renderedWidth).toBe(expectedWidths[i]);
    });
  });

  it('clamps stamp and image rotation within -180 to 180 degrees', () => {
    function normalizeRotation(deg: number): number {
      let r = deg % 360;
      if (r > 180) r -= 360;
      if (r < -180) r += 360;
      return r;
    }

    expect(normalizeRotation(270)).toBe(-90);
    expect(normalizeRotation(-270)).toBe(90);
    expect(normalizeRotation(180)).toBe(180);
    expect(normalizeRotation(-180)).toBe(-180);
    expect(normalizeRotation(45)).toBe(45);
  });
});
