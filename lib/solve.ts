// Finds moves that put every piece back and leave each centre picture the right way up.
//
// Kociemba's two-phase algorithm (via cubejs) solves the pieces in about 20 moves but
// ignores centres. Every quarter turn of a face also turns its centre, so a solution leaves
// each centre turned by however many quarter turns that face got. Whatever is still wrong
// is put right by a sequence from centre-fixes.json, which moves no pieces and only turns
// centres. Then, for a second or so, we try solutions that start with a few random moves,
// since one of them may turn the centres right by itself and save the fix.

import Cube from "cubejs";

import FIXES from "./centre-fixes.json";
import { type Face, FACES, type Move, centreTurns, parseMoves, simplify } from "./cube";

let ready = false;

/** Builds the solver's lookup tables. Takes a few seconds, so call it early. */
export function prepare() {
  if (!ready) Cube.initSolver();
  ready = true;
}

/** Quarter turns clockwise each centre still needs, or null when the centre looks the same any way up. */
export type CentreNeeds = Record<Face, number | null>;

const NO_CENTRES: CentreNeeds = { U: null, R: null, F: null, D: null, L: null, B: null };
const fixes = FIXES as Record<string, string>;

/**
 * The shortest sequence that turns each centre by `delta` and moves nothing else. A centre
 * can't be turned on its own, only in step with others, so the turns must add up to an even
 * number; centres that can be any way up make up the difference.
 */
export function centreFix(delta: (number | null)[]): Move[] | null {
  let options = [""];
  for (const d of delta) options = options.flatMap((o) => (d === null ? [0, 1, 2, 3] : [d]).map((v) => o + v));
  const found = options.map((k) => fixes[k]).filter((m) => m !== undefined);
  if (!found.length) return null;
  return parseMoves(found.reduce((a, b) => (parseMoves(a).length <= parseMoves(b).length ? a : b)));
}

function finish(solution: Move[], needs: CentreNeeds): Move[] | null {
  const turned = centreTurns(solution);
  const fix = centreFix(FACES.map((f) => (needs[f] === null ? null : (needs[f]! - turned[f] + 4) % 4)));
  return fix && simplify([...solution, ...fix]);
}

/** A small seeded random number generator, so tests and retries are repeatable. */
function random(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

/**
 * Moves that solve the cube described by `facelets` (54 face letters) and turn each centre
 * as needed, or null if the centres asked for can't happen on a real cube.
 */
export function solve(facelets: string, needs: CentreNeeds = NO_CENTRES, { timeMs = 1500, seed = 1 } = {}): Move[] | null {
  prepare();
  const plain = parseMoves(Cube.fromString(facelets).solve());
  let best = finish(plain, needs);
  if (!best) return null;

  const rand = random(seed);
  const start = Date.now();
  while (Date.now() - start < timeMs && best.length > plain.length + 2) {
    const prefix: Move[] = [];
    const length = 1 + Math.floor(rand() * 5);
    while (prefix.length < length) {
      const face = FACES[Math.floor(rand() * 6)];
      if (prefix.at(-1)?.[0] === face) continue;
      prefix.push(`${face}${["", "2", "'"][Math.floor(rand() * 3)]}` as Move);
    }
    const cube = Cube.fromString(facelets).move(prefix.join(" "));
    const moves = finish(simplify([...prefix, ...parseMoves(cube.solve())]), needs);
    if (moves && moves.length < best.length) best = moves;
  }
  return best;
}
