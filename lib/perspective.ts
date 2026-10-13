// Straightening a photo taken at an angle. The face of the cube is a square, but in a tilted photo
// it's a four-sided shape; a projective transform (homography) maps the square onto that shape, so
// each tile can be read back square.

export type Point = { x: number; y: number };
/** Corners of the face in the photo: top left, top right, bottom right, bottom left. */
export type Quad = [Point, Point, Point, Point];

/**
 * The projective map from the unit square onto `quad`: (0,0) to the top left corner, (1,0) to the
 * top right, (1,1) to the bottom right and (0,1) to the bottom left (Heckbert, 1989).
 */
export function squareToQuad([p0, p1, p2, p3]: Quad): (u: number, v: number) => Point {
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;
  let g = 0;
  let h = 0;
  if (sx !== 0 || sy !== 0) {
    const det = dx1 * dy2 - dx2 * dy1;
    g = (sx * dy2 - dx2 * sy) / det;
    h = (dx1 * sy - sx * dy1) / det;
  }
  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + h * p3.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + h * p3.y;
  return (u, v) => {
    const w = g * u + h * v + 1;
    return { x: (a * u + b * v + p0.x) / w, y: (d * u + e * v + p0.y) / w };
  };
}

/** A square quad, `fraction` of the shorter side, centred in a `width` x `height` image. */
export function centredSquare(width: number, height: number, fraction = 0.7): Quad {
  const size = Math.min(width, height) * fraction;
  const x = (width - size) / 2;
  const y = (height - size) / 2;
  return [
    { x, y },
    { x: x + size, y },
    { x: x + size, y: y + size },
    { x, y: y + size },
  ];
}
