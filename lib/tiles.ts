// Cuts a photo of one face into nine tiles, and describes each tile by its colours so
// tiles from the same picture can be grouped.

export type Tile = { image: string; colours: number[] };

const TILE_PX = 160;
const BINS = 4; // per channel, so 64 colour bins

/** Fraction of each tile trimmed off every edge, to skip the black plastic between tiles. */
const INSET = 0.08;

export type Square = { x: number; y: number; size: number };

/** The nine tiles inside `square` (source pixels) of `source`, read left to right, top to bottom. */
export function cutTiles(source: CanvasImageSource, square: Square): Tile[] {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TILE_PX;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const step = square.size / 3;
  const tiles: Tile[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const sx = square.x + col * step + step * INSET;
      const sy = square.y + row * step + step * INSET;
      const s = step * (1 - 2 * INSET);
      ctx.drawImage(source, sx, sy, s, s, 0, 0, TILE_PX, TILE_PX);
      tiles.push({ image: canvas.toDataURL("image/jpeg", 0.85), colours: fingerprint(ctx.getImageData(0, 0, TILE_PX, TILE_PX).data) });
    }
  }
  return tiles;
}

/**
 * A tile's colour fingerprint, three histograms side by side:
 * - 60%: share of pixels in each of 64 colour bins (4 levels each of red, green and blue);
 * - 30%: hue of the coloured pixels (12 bins), plus the share that are near-grey, so a pale tile
 *   with a tint of lilac differs from one with a tint of yellow;
 * - 10%: brightness (8 bins).
 * The weights were chosen on photos of a real picture cube, where pale tiles from different sides
 * are the hard cases (test/fixtures/real-cube.json).
 */
export function fingerprint(pixels: ArrayLike<number>, stride = 4): number[] {
  const n = pixels.length / stride;
  const rgb = new Array(BINS ** 3).fill(0);
  const hue = new Array(12).fill(0);
  const bright = new Array(8).fill(0);
  let grey = 0;
  for (let i = 0; i < pixels.length; i += stride) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    rgb[(Math.floor((r * BINS) / 256) * BINS + Math.floor((g * BINS) / 256)) * BINS + Math.floor((b * BINS) / 256)] += 0.6 / n;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const value = max / 255;
    bright[Math.min(7, Math.floor(value * 8))] += 0.1 / n;
    if (max && (max - min) / max > 0.12 && value > 0.15) {
      const d = max - min;
      let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      if (h < 0) h += 6;
      hue[Math.min(11, Math.floor(h * 2))] += 0.3 / n;
    } else grey += 0.3 / n;
  }
  return [...rgb, ...hue, grey, ...bright];
}

/** 0 for identical colour mixes, 1 for nothing in common. */
export function colourDistance(a: number[], b: number[]) {
  let overlap = 0;
  for (let i = 0; i < a.length; i++) overlap += Math.min(a[i], b[i]);
  return 1 - overlap;
}
