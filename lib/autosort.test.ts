import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { assign, autosort } from "./autosort";
import { problems } from "./pieces";
import { fingerprint } from "./tiles";

// Thumbnails of every tile from six photos of a real scrambled picture cube, with the right answer.
const real = JSON.parse(readFileSync(join(__dirname, "../test/fixtures/real-cube.json"), "utf8"));

describe("assign", () => {
  it("finds the cheapest one-to-one matching", () => {
    const cost = [
      [4, 1, 3],
      [2, 0, 5],
      [3, 2, 2],
    ];
    expect(assign(cost)).toEqual([1, 0, 2]); // 1 + 2 + 2 = 5
  });
});

describe("autosort", () => {
  const labels = autosort(real.pixels.map((p: number[]) => fingerprint(p, 3)));

  it("always gives a real cube", () => {
    expect(problems(labels)).toEqual([]);
  });

  it("sorts every tile of a real picture cube correctly", () => {
    expect(labels.join("")).toBe(real.labels);
  });
});
