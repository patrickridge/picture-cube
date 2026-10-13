import { describe, expect, it } from "vitest";

import { centredSquare, type Quad, squareToQuad } from "./perspective";

describe("squareToQuad", () => {
  const tilted: Quad = [
    { x: 100, y: 120 },
    { x: 520, y: 80 },
    { x: 560, y: 600 },
    { x: 60, y: 540 },
  ];

  it("sends the square's corners to the quad's corners", () => {
    const map = squareToQuad(tilted);
    const corners = [map(0, 0), map(1, 0), map(1, 1), map(0, 1)];
    corners.forEach((c, i) => {
      expect(c.x).toBeCloseTo(tilted[i].x, 6);
      expect(c.y).toBeCloseTo(tilted[i].y, 6);
    });
  });

  it("keeps straight lines straight, so tile edges line up", () => {
    const map = squareToQuad(tilted);
    const [a, b, c] = [map(1 / 3, 0), map(1 / 3, 0.5), map(1 / 3, 1)];
    const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    expect(Math.abs(cross)).toBeLessThan(1e-6);
  });

  it("is a plain scale and shift for a square", () => {
    const map = squareToQuad(centredSquare(1000, 800, 0.5));
    expect(map(0.5, 0.5)).toEqual({ x: 500, y: 400 });
  });
});
