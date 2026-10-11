import { describe, expect, it } from "vitest";

import FIXES from "./centre-fixes.json";
import { applyMoves, FACES, parseMoves, solvedState } from "./cube";

describe("centre fixes", () => {
  const entries = Object.entries(FIXES as Record<string, string>);

  it("covers every pattern a real cube can need", () => {
    // Turns must add up to an even number, so half of the 4^6 patterns.
    expect(entries.length).toBe(2048);
  });

  it("moves no pieces and turns each centre as labelled", () => {
    for (const [key, moves] of entries) {
      const state = applyMoves(solvedState(), parseMoves(moves));
      expect(state.every((s, i) => s.home === i), key).toBe(true);
      expect(FACES.map((_, f) => state[f * 9 + 4].turns).join(""), moves).toBe(key);
    }
  });
});
