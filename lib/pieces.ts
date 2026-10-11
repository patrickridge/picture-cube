// Checks that a set of tile labels describes a cube that can actually be solved.
// A label is the face a tile belongs on. Each check turns a misread tile into a
// message someone can act on, before the solver is asked to do the impossible.

import { FACES, type Face, faceOf } from "./cube";

export const CORNERS = [
  [8, 9, 20], [6, 18, 38], [0, 36, 47], [2, 45, 11],
  [29, 26, 15], [27, 44, 24], [33, 53, 42], [35, 17, 51],
] as const;

export const EDGES = [
  [5, 10], [7, 19], [3, 37], [1, 46], [32, 16], [28, 25],
  [30, 43], [34, 52], [23, 12], [21, 41], [50, 39], [48, 14],
] as const;

const OPPOSITE: Record<Face, Face> = { U: "D", D: "U", R: "L", L: "R", F: "B", B: "F" };

/** The faces of each solved piece, in facelet order, e.g. "URF". */
const cornerNames = CORNERS.map((p) => p.map(faceOf).join(""));
const edgeNames = EDGES.map((p) => p.map(faceOf).join(""));

export type Problem =
  | { kind: "count"; face: Face; count: number }
  | { kind: "piece"; facelets: readonly number[] }
  | { kind: "repeat"; facelets: readonly number[] }
  | { kind: "twist" }
  | { kind: "flip" }
  | { kind: "swap" };

/** Which solved piece these labels make, and how it is turned, or null if no piece looks like that. */
function identify(labels: Face[], names: string[]) {
  const sorted = (s: string) => [...s].sort().join("");
  const index = names.findIndex((n) => sorted(n) === sorted(labels.join("")));
  if (index < 0) return null;
  return { index, twist: labels.indexOf(names[index][0] as Face) };
}

const isOdd = (perm: number[]) => {
  let odd = false;
  const seen = new Set<number>();
  for (let i = 0; i < perm.length; i++) {
    if (seen.has(i)) continue;
    let length = 0;
    for (let j = i; !seen.has(j); j = perm[j]) {
      seen.add(j);
      length++;
    }
    if (length % 2 === 0) odd = !odd;
  }
  return odd;
};

export function problems(labels: Face[]): Problem[] {
  const found: Problem[] = [];
  for (const face of FACES) {
    const count = labels.filter((l) => l === face).length;
    if (count !== 9) found.push({ kind: "count", face, count });
  }

  const check = (pieces: readonly (readonly number[])[], names: string[]) => {
    const placed: (ReturnType<typeof identify> & {})[] = [];
    const seen = new Map<number, readonly number[]>();
    for (const facelets of pieces) {
      const ls = facelets.map((f) => labels[f]);
      const bad = new Set(ls).size < ls.length || ls.some((l) => ls.includes(OPPOSITE[l]));
      const piece = bad ? null : identify(ls, names);
      if (!piece) {
        found.push({ kind: "piece", facelets });
        continue;
      }
      if (seen.has(piece.index)) found.push({ kind: "repeat", facelets });
      seen.set(piece.index, facelets);
      placed.push(piece);
    }
    return placed.length === pieces.length && seen.size === pieces.length ? placed : null;
  };

  const corners = check(CORNERS, cornerNames);
  const edges = check(EDGES, edgeNames);
  if (found.length) return found;

  if (corners!.reduce((sum, c) => sum + c.twist, 0) % 3) found.push({ kind: "twist" });
  if (edges!.reduce((sum, e) => sum + e.twist, 0) % 2) found.push({ kind: "flip" });
  if (isOdd(corners!.map((c) => c.index)) !== isOdd(edges!.map((e) => e.index))) found.push({ kind: "swap" });
  return found;
}

/**
 * Single-tile changes that would make the cube valid. Pale or plain tiles are the
 * usual misreads, and when only one change works it is almost always the right one.
 */
export function singleFixes(labels: Face[]): { facelet: number; face: Face }[] {
  const fixes: { facelet: number; face: Face }[] = [];
  labels.forEach((current, facelet) => {
    if (facelet % 9 === 4) return; // centres define the faces
    for (const face of FACES) {
      if (face === current) continue;
      const trial = [...labels];
      trial[facelet] = face;
      if (problems(trial).length === 0) fixes.push({ facelet, face });
    }
  });
  return fixes;
}

/**
 * Two-tile swaps that would make the cube valid. A count of 10 on one side and 8 on another
 * with no single fix usually means two tiles were given each other's side.
 */
export function swapFixes(labels: Face[]): [number, number][] {
  const swaps: [number, number][] = [];
  for (let a = 0; a < 54; a++) {
    for (let b = a + 1; b < 54; b++) {
      if (a % 9 === 4 || b % 9 === 4 || labels[a] === labels[b]) continue;
      const trial = [...labels];
      [trial[a], trial[b]] = [trial[b], trial[a]];
      if (problems(trial).length === 0) swaps.push([a, b]);
    }
  }
  return swaps;
}
