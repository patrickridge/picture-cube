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
      tiles.push({ image: canvas.toDataURL("image/jpeg", 0.85), colours: histogram(ctx.getImageData(0, 0, TILE_PX, TILE_PX).data) });
    }
  }
  return tiles;
}

/** Share of a tile's pixels in each colour bin. */
export function histogram(pixels: Uint8ClampedArray): number[] {
  const counts = new Array(BINS ** 3).fill(0);
  const width = BINS / 256;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = Math.floor(pixels[i] * width);
    const g = Math.floor(pixels[i + 1] * width);
    const b = Math.floor(pixels[i + 2] * width);
    counts[(r * BINS + g) * BINS + b]++;
  }
  const total = pixels.length / 4;
  return counts.map((c) => c / total);
}

/** 0 for identical colour mixes, 1 for nothing in common. */
export function colourDistance(a: number[], b: number[]) {
  let overlap = 0;
  for (let i = 0; i < a.length; i++) overlap += Math.min(a[i], b[i]);
  return 1 - overlap;
}
