import { describe, expect, it } from "vitest";

import type { Face } from "./cube";
import { problems, singleFixes, swapFixes } from "./pieces";

const read = (s: string) => [...s] as Face[];
const SOLVED = read("UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");

// Real readings of a scrambled picture cube, taken from photos, before and after fixing the
// one pale tile that was misread each time.
const MISREAD = read("UUUDUUDDDBRRLRRRRLRLLBFFLFFUDDUDDUUDRBBRLLDFFBBFBBFFLL");
const FIXED = [...MISREAD];
FIXED[42] = "B";

describe("problems", () => {
  it("finds none on a solved cube or a correct reading", () => {
    expect(problems(SOLVED)).toEqual([]);
    expect(problems(FIXED)).toEqual([]);
  });

  it("reports wrong counts and the piece that can't exist", () => {
    expect(problems(MISREAD)).toEqual([
      { kind: "count", face: "D", count: 10 },
      { kind: "count", face: "B", count: 8 },
      { kind: "piece", facelets: [33, 53, 42] },
    ]);
  });

  it("spots a twisted corner, a flipped edge and two swapped pieces", () => {
    const twisted = [...SOLVED];
    [twisted[8], twisted[9], twisted[20]] = ["R", "F", "U"];
    expect(problems(twisted)).toEqual([{ kind: "twist" }]);

    const flipped = [...SOLVED];
    [flipped[5], flipped[10]] = ["R", "U"];
    expect(problems(flipped)).toEqual([{ kind: "flip" }]);

    const swapped = [...SOLVED];
    [swapped[7], swapped[19]] = ["U", "R"]; // UF edge shows UR
    [swapped[5], swapped[10]] = ["U", "F"]; // UR edge shows UF
    expect(problems(swapped)).toEqual([{ kind: "swap" }]);
  });
});

describe("fixes", () => {
  it("finds the single misread tile", () => {
    expect(singleFixes(MISREAD)).toEqual([{ facelet: 42, face: "B" }]);
  });

  it("finds two tiles given each other's side", () => {
    const mixed = [...FIXED];
    [mixed[1], mixed[28]] = [mixed[28], mixed[1]];
    expect(swapFixes(mixed)).toContainEqual([1, 28]);
  });
});
