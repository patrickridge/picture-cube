// A 3x3 cube as 54 stickers, tracking where each sticker is and which way up it is.
// Colour cubes only need the first; picture cubes need both, because a centre that is
// turned the wrong way spoils the picture even when every piece is in place.
//
// Facelets use the usual order U R F D L B, nine per face, read left to right and top
// to bottom (U seen from above with B at the top, D seen from below with F at the top,
// the sides seen from outside with U at the top).

export const FACES = ["U", "R", "F", "D", "L", "B"] as const;
export type Face = (typeof FACES)[number];

type Vec = readonly [number, number, number];

const FRAMES: Record<Face, { normal: Vec; right: Vec; down: Vec }> = {
  U: { normal: [0, 1, 0], right: [1, 0, 0], down: [0, 0, 1] },
  R: { normal: [1, 0, 0], right: [0, 0, -1], down: [0, -1, 0] },
  F: { normal: [0, 0, 1], right: [1, 0, 0], down: [0, -1, 0] },
  D: { normal: [0, -1, 0], right: [1, 0, 0], down: [0, 0, -1] },
  L: { normal: [-1, 0, 0], right: [0, 0, 1], down: [0, -1, 0] },
  B: { normal: [0, 0, -1], right: [-1, 0, 0], down: [0, -1, 0] },
};

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const same = (a: Vec, b: Vec) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

/** Quarter turn of v clockwise, as seen looking at the face whose outward normal is `axis`. */
function quarterTurn(v: Vec, axis: Vec): Vec {
  // Rodrigues' formula with an angle of -90 degrees.
  return add(scale(cross(axis, v), -1), scale(axis, dot(axis, v)));
}

type Sticker = { home: number; position: Vec; normal: Vec; up: Vec };

/** Where each sticker is now: `at[i]` is the sticker on facelet i, and how many quarter turns clockwise it is from upright. */
export type State = { home: number; turns: number }[];

export const faceOf = (facelet: number): Face => FACES[Math.floor(facelet / 9)];

function sticker(facelet: number): Sticker {
  const { normal, right, down } = FRAMES[faceOf(facelet)];
  const row = Math.floor((facelet % 9) / 3);
  const col = facelet % 3;
  const position = add(add(normal, scale(right, col - 1)), scale(down, row - 1));
  return { home: facelet, position, normal, up: scale(down, -1) };
}

function faceletAt(s: Sticker): { facelet: number; turns: number } {
  const face = FACES.find((f) => same(FRAMES[f].normal, s.normal))!;
  const { normal, right, down } = FRAMES[face];
  const offset = add(s.position, scale(normal, -1));
  const facelet = FACES.indexOf(face) * 9 + (dot(offset, down) + 1) * 3 + dot(offset, right) + 1;
  const up = scale(down, -1);
  const turns = same(s.up, up) ? 0 : same(s.up, right) ? 1 : same(s.up, down) ? 2 : 3;
  return { facelet, turns };
}

export type Move = `${Face}${"" | "'" | "2"}`;

export const parseMoves = (moves: string): Move[] => moves.split(/\s+/).filter(Boolean) as Move[];

export const quarterTurns = (move: Move) => (move.endsWith("2") ? 2 : move.endsWith("'") ? 3 : 1);

export const solvedState = (): State => Array.from({ length: 54 }, (_, i) => ({ home: i, turns: 0 }));

/** Apply moves to a state. Each move turns one face clockwise (once, twice, or three times for '). */
export function applyMoves(state: State, moves: Move[]): State {
  let stickers = state.map((s, facelet) => {
    const st = sticker(facelet);
    let up = st.up;
    for (let k = 0; k < s.turns; k++) up = quarterTurn(up, st.normal);
    return { ...st, home: s.home, up };
  });
  for (const move of moves) {
    const axis = FRAMES[move[0] as Face].normal;
    for (let k = 0; k < quarterTurns(move); k++) {
      stickers = stickers.map((s) =>
        dot(s.position, axis) === 1
          ? { home: s.home, position: quarterTurn(s.position, axis), normal: quarterTurn(s.normal, axis), up: quarterTurn(s.up, axis) }
          : s,
      );
    }
  }
  const next: State = new Array(54);
  for (const s of stickers) {
    const { facelet, turns } = faceletAt(s);
    next[facelet] = { home: s.home, turns };
  }
  return next;
}

export const invert = (moves: Move[]): Move[] =>
  [...moves].reverse().map((m) => (m.endsWith("2") ? m : m.endsWith("'") ? (m[0] as Move) : (`${m}'` as Move)));

/** Net quarter turns of each face over a sequence, which is how far each centre ends up turned. */
export function centreTurns(moves: Move[]): Record<Face, number> {
  const turns = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
  for (const m of moves) turns[m[0] as Face] = (turns[m[0] as Face] + quarterTurns(m)) % 4;
  return turns;
}

/** Merge neighbouring turns of the same face, so "U U" becomes "U2" and "R R'" disappears. */
export function simplify(moves: Move[]): Move[] {
  const out: Move[] = [];
  for (const m of moves) {
    const last = out.at(-1);
    if (last && last[0] === m[0]) {
      out.pop();
      const total = (quarterTurns(last) + quarterTurns(m)) % 4;
      if (total) out.push(`${m[0]}${["", "", "2", "'"][total]}` as Move);
    } else out.push(m);
  }
  return out;
}
