import { describe, expect, it } from "vitest";

import { applyMoves, centreTurns, faceOf, invert, parseMoves, solvedState } from "./cube";
import { solve } from "./solve";

const scramble = parseMoves("R U2 F' L D B2 R' U F2 D' L2 B U' R2");
const scrambled = applyMoves(solvedState(), scramble);
const facelets = scrambled.map((s) => faceOf(s.home)).join("");

// How far each centre needs turning to come back upright after the scramble.
const needs = centreTurns(invert(scramble));

describe("solve", () => {
  it("puts every piece back", () => {
    const moves = solve(facelets)!;
    const end = applyMoves(scrambled, moves);
    expect(end.every((s, i) => s.home === i)).toBe(true);
  });

  it("also turns every centre upright", () => {
    const moves = solve(facelets, needs, { timeMs: 500 })!;
    expect(applyMoves(scrambled, moves)).toEqual(solvedState());
  }, 30_000);

  it("leaves plain centres however they fall", () => {
    const picture = { U: needs.U, R: null, F: needs.F, D: null, L: null, B: null };
    const end = applyMoves(scrambled, solve(facelets, picture, { timeMs: 200 })!);
    expect(end.every((s, i) => s.home === i)).toBe(true);
    expect([end[4].turns, end[22].turns]).toEqual([0, 0]);
  }, 30_000);

  it("refuses centre turns that can't happen on a real cube", () => {
    expect(solve(facelets, { ...needs, U: (needs.U + 1) % 4 }, { timeMs: 200 })).toBeNull();
  });
});
