import Cube from "cubejs";
import { describe, expect, it } from "vitest";

import { applyMoves, centreTurns, faceOf, invert, parseMoves, simplify, solvedState, type State } from "./cube";

const labels = (state: State) => state.map((s) => faceOf(s.home)).join("");

describe("sticker model", () => {
  it("agrees with cubejs on where stickers go", () => {
    const moves = "R U2 F' L D B2 R' U F2 D' L2 B";
    const cube = new Cube().move(moves);
    expect(labels(applyMoves(solvedState(), parseMoves(moves)))).toBe(cube.asString());
  });

  it("turns the face's centre with each quarter turn", () => {
    const state = applyMoves(solvedState(), parseMoves("U"));
    expect(state[4]).toEqual({ home: 4, turns: 1 });
    expect(applyMoves(solvedState(), parseMoves("U'"))[4].turns).toBe(3);
    expect(applyMoves(solvedState(), parseMoves("F2"))[22].turns).toBe(2);
  });

  it("returns everything after a move and its inverse", () => {
    const moves = parseMoves("R U R' F2 D L'");
    expect(applyMoves(solvedState(), [...moves, ...invert(moves)])).toEqual(solvedState());
  });

  it("brings a sticker round upright after four turns of its face", () => {
    expect(applyMoves(solvedState(), parseMoves("R R R R"))).toEqual(solvedState());
  });
});

describe("centre turns", () => {
  it("adds up quarter turns per face", () => {
    expect(centreTurns(parseMoves("U R2 U F' U2"))).toEqual({ U: 0, R: 2, F: 3, D: 0, L: 0, B: 0 });
  });

  it("matches the sticker model on a sequence that only turns centres", () => {
    // Found while solving a real picture cube: puts every piece back but turns three centres.
    const moves = parseMoves("B R2 D2 F B2 D R2 F2 D' L2 F2 U B U2 F2 U2 F2 B2 U' R2 B2 U L2 D' F2 D'");
    const state = applyMoves(solvedState(), moves);
    expect(state.every((s, i) => s.home === i)).toBe(true);
    expect([state[4].turns, state[13].turns, state[22].turns]).toEqual([1, 2, 3]);
    expect(centreTurns(moves)).toMatchObject({ U: 1, R: 2, F: 3 });
  });

  it("merges neighbouring turns of the same face", () => {
    expect(simplify(parseMoves("U U R R' F2 F2 L L L"))).toEqual(["U2", "L'"]);
  });
});
