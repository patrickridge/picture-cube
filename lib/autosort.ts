// A first guess at which side each tile belongs to.
//
// Sorting tiles one at a time by colour fails on picture cubes, because many tiles are pale
// fragments that could belong to several sides. So this sorts whole pieces instead. Each corner
// slot must hold one of the eight real corners (in one of three twists), and each edge slot one of
// the twelve real edges (one of two flips), each used once. Choosing which piece goes where is an
// assignment problem, solved exactly with the Hungarian algorithm, where the cost of a piece in a
// slot is how badly its tiles' colours fit the sides they'd belong to. The result is always a real
// set of pieces; a final step fixes any twist, flip or swap the cube's rules rule out, at the
// smallest cost in colour fit. Sides' colours are then re-estimated from their tiles and it repeats.

import { FACES, type Face, faceOf } from "./cube";
import { CORNERS, EDGES, problems } from "./pieces";
import { colourDistance } from "./tiles";

const average = (sets: number[][]) => sets[0].map((_, i) => sets.reduce((sum, s) => sum + s[i], 0) / sets.length);

/** Minimum-cost assignment of rows to columns of a square cost matrix (Hungarian algorithm). */
export function assign(cost: number[][]): number[] {
  const n = cost.length;
  const u = new Array(n + 1).fill(0);
  const v = new Array(n + 1).fill(0);
  const p = new Array(n + 1).fill(0); // p[column] = row
  const way = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(n + 1).fill(Infinity);
    const used = new Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }
        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }
  const rowToColumn = new Array(n);
  for (let j = 1; j <= n; j++) rowToColumn[p[j] - 1] = j - 1;
  return rowToColumn;
}

/** The faces of each solved piece, in facelet order, e.g. ["U", "R", "F"]. */
const cornerPieces = CORNERS.map((slot) => slot.map(faceOf));
const edgePieces = EDGES.map((slot) => slot.map(faceOf));

/** The ways a piece can sit in a slot: corners twist (3 rotations), edges flip (2). */
const turnings = (piece: Face[]) => piece.map((_, k) => piece.map((__, i) => piece[(i + k) % piece.length]));

interface Placement {
  piece: number;
  turn: number;
  cost: number;
}

/** Best orientation of each piece in each slot, and the cost of it. */
function options(slots: readonly (readonly number[])[], pieces: Face[][], fit: (tile: number, face: Face) => number) {
  return slots.map((slot) =>
    pieces.map((piece, index) =>
      turnings(piece).map((faces, turn): Placement => ({ piece: index, turn, cost: slot.reduce((sum, tile, i) => sum + fit(tile, faces[i]), 0) })),
    ),
  );
}

function place(labels: Face[], slots: readonly (readonly number[])[], pieces: Face[][], chosen: Placement[]) {
  chosen.forEach((c, s) => {
    const faces = turnings(pieces[c.piece])[c.turn];
    slots[s].forEach((tile, i) => (labels[tile] = faces[i]));
  });
}

function solveOnce(fit: (tile: number, face: Face) => number): Face[] {
  const labels: Face[] = Array.from({ length: 54 }, (_, i) => faceOf(i)); // centres stay as they are
  const choose = (slots: readonly (readonly number[])[], pieces: Face[][]) => {
    const opts = options(slots, pieces, fit);
    const best = opts.map((perSlot) => perSlot.map((turns) => turns.reduce((a, b) => (b.cost < a.cost ? b : a))));
    const match = assign(best.map((row) => row.map((p) => p.cost)));
    return { opts, chosen: match.map((piece, slot) => best[slot][piece]) };
  };
  const corners = choose(CORNERS, cornerPieces);
  const edges = choose(EDGES, edgePieces);
  place(labels, CORNERS, cornerPieces, corners.chosen);
  place(labels, EDGES, edgePieces, edges.chosen);
  if (problems(labels).length === 0) return labels;

  // Twist, flip and swap problems: try the cheapest changes that clear them.
  type Change = { cost: number; apply: (l: Face[]) => void };
  const changes: Change[] = [];
  const retwist = (group: typeof corners, slots: readonly (readonly number[])[], pieces: Face[][]) =>
    group.chosen.forEach((c, s) =>
      group.opts[s][c.piece].forEach((alt) => {
        if (alt.turn !== c.turn) changes.push({ cost: alt.cost - c.cost, apply: (l) => place(l, [slots[s]], pieces, [alt]) });
      }),
    );
  retwist(corners, CORNERS, cornerPieces);
  retwist(edges, EDGES, edgePieces);
  const swaps = (group: typeof corners, slots: readonly (readonly number[])[], pieces: Face[][]) => {
    for (let a = 0; a < group.chosen.length; a++) {
      for (let b = a + 1; b < group.chosen.length; b++) {
        const pa = group.chosen[a].piece;
        const pb = group.chosen[b].piece;
        const altA = group.opts[a][pb].reduce((x, y) => (y.cost < x.cost ? y : x));
        const altB = group.opts[b][pa].reduce((x, y) => (y.cost < x.cost ? y : x));
        const cost = altA.cost + altB.cost - group.chosen[a].cost - group.chosen[b].cost;
        changes.push({ cost, apply: (l) => place(l, [slots[a], slots[b]], pieces, [altA, altB]) });
      }
    }
  };
  swaps(corners, CORNERS, cornerPieces);
  swaps(edges, EDGES, edgePieces);
  changes.sort((x, y) => x.cost - y.cost);

  // One change, then pairs of changes, cheapest first.
  for (const c of changes.slice(0, 200)) {
    const trial = [...labels];
    c.apply(trial);
    if (problems(trial).length === 0) return trial;
  }
  let best: { cost: number; labels: Face[] } | null = null;
  const top = changes.slice(0, 80);
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      const cost = top[i].cost + top[j].cost;
      if (best && cost >= best.cost) continue;
      const trial = [...labels];
      top[i].apply(trial);
      top[j].apply(trial);
      if (problems(trial).length === 0) best = { cost, labels: trial };
    }
  }
  return best?.labels ?? labels;
}

export function autosort(colours: number[][]): Face[] {
  // Start by describing each side by its centre tile, then by all the tiles it was given.
  let model = FACES.map((_, f) => colours[f * 9 + 4]);
  let labels: Face[] = [];
  for (let round = 0; round < 5; round++) {
    const fit = (tile: number, face: Face) => colourDistance(colours[tile], model[FACES.indexOf(face)]);
    const next = solveOnce(fit);
    if (labels.length && next.every((l, i) => l === labels[i])) break;
    labels = next;
    model = FACES.map((f) => average(colours.filter((_, t) => labels[t] === f)));
  }
  return labels;
}
