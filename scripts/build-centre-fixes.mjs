// Builds lib/centre-fixes.json: for every way the six centres can need turning, a short
// sequence that leaves every piece where it is and turns the centres by that much.
//
// Each sequence is found by scrambling a solved cube with a few random moves and letting
// Kociemba's algorithm solve it: scramble + solution puts every piece back, and the turns on
// each face add up to some centre pattern. Every sequence found also covers 47 more patterns
// by turning or mirroring the whole cube. Run several copies with different seeds, then merge:
//
//   node scripts/build-centre-fixes.mjs search <seed> <minutes>   (writes a partial file)
//   node scripts/build-centre-fixes.mjs merge                     (writes lib/centre-fixes.json)

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import Cube from "cubejs";

const FACES = ["U", "R", "F", "D", "L", "B"];
const TURNS = { "": 1, 2: 2, "'": 3 };
const SUFFIX = ["", "", "2", "'"];

const parse = (s) => s.split(/\s+/).filter(Boolean);
const turns = (m) => TURNS[m.slice(1)];
const key = (moves) => {
  const c = [0, 0, 0, 0, 0, 0];
  for (const m of moves) c[FACES.indexOf(m[0])] = (c[FACES.indexOf(m[0])] + turns(m)) % 4;
  return c.join("");
};
const simplify = (moves) => {
  const out = [];
  for (const m of moves) {
    const last = out.at(-1);
    if (last && last[0] === m[0]) {
      out.pop();
      const t = (turns(last) + turns(m)) % 4;
      if (t) out.push(m[0] + SUFFIX[t]);
    } else out.push(m);
  }
  return out;
};

// The 24 ways to turn the whole cube, as face relabellings, plus their mirror images.
const Y = { U: "U", D: "D", F: "L", L: "B", B: "R", R: "F" };
const X = { R: "R", L: "L", F: "U", U: "B", B: "D", D: "F" };
const compose = (a, b) => Object.fromEntries(FACES.map((f) => [f, b[a[f]]]));
const rotations = [Object.fromEntries(FACES.map((f) => [f, f]))];
for (let i = 0; i < rotations.length; i++) {
  for (const g of [X, Y]) {
    const r = compose(rotations[i], g);
    if (!rotations.some((s) => FACES.every((f) => s[f] === r[f]))) rotations.push(r);
  }
}
const relabel = (moves, map, mirror) =>
  moves.map((m) => {
    let face = map[m[0]];
    let t = turns(m);
    if (mirror) {
      face = { R: "L", L: "R" }[face] ?? face;
      t = (4 - t) % 4;
    }
    return face + SUFFIX[t];
  });

const [mode, seedArg, minutesArg] = process.argv.slice(2);

if (mode === "search") {
  Cube.initSolver();
  let seed = Number(seedArg);
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const best = {};
  const offer = (moves) => {
    for (const r of rotations) {
      for (const mirror of [false, true]) {
        const m = relabel(moves, r, mirror);
        const k = key(m);
        if (!best[k] || best[k].length > m.length) best[k] = m;
      }
    }
  };
  const end = Date.now() + Number(minutesArg) * 60_000;
  while (Date.now() < end) {
    const prefix = [];
    const length = 2 + Math.floor(rand() * 7);
    while (prefix.length < length) {
      const f = FACES[Math.floor(rand() * 6)];
      if (prefix.at(-1)?.[0] === f) continue;
      prefix.push(f + ["", "2", "'"][Math.floor(rand() * 3)]);
    }
    const solution = parse(new Cube().move(prefix.join(" ")).solve());
    offer(simplify([...prefix, ...solution]));
  }
  writeFileSync(`centre-fixes.${seedArg}.json`, JSON.stringify(best));
  console.log(seedArg, Object.keys(best).length, "patterns");
} else if (mode === "merge") {
  const best = { "000000": [] };
  for (const file of readdirSync(".").filter((f) => /^centre-fixes\.\d+\.json$/.test(f))) {
    for (const [k, m] of Object.entries(JSON.parse(readFileSync(file, "utf8")))) {
      if (!best[k] || best[k].length > m.length) best[k] = m;
    }
  }
  const sorted = Object.fromEntries(Object.keys(best).sort().map((k) => [k, best[k].join(" ")]));
  writeFileSync("lib/centre-fixes.json", JSON.stringify(sorted, null, 0) + "\n");
  const lengths = Object.values(best).map((m) => m.length);
  console.log(lengths.length, "patterns, longest", Math.max(...lengths), "average", (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1));
}
