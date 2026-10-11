// A first guess at which side each tile belongs to, from its colours.
//
// Each side starts out described by its centre tile. Tiles are handed out nine to a side,
// closest match first, then each side's description is updated from the tiles it got and
// the hand-out is repeated. Finally, if the result can't be a real cube, single changes
// and swaps that would make it valid are tried, preferring ones that fit the colours.

import { FACES, type Face } from "./cube";
import { problems, singleFixes, swapFixes } from "./pieces";
import { colourDistance } from "./tiles";

const average = (sets: number[][]) => sets[0].map((_, i) => sets.reduce((sum, s) => sum + s[i], 0) / sets.length);

export function autosort(colours: number[][]): Face[] {
  let centres = FACES.map((_, f) => colours[f * 9 + 4]);
  let labels: Face[] = [];

  for (let round = 0; round < 6; round++) {
    const pairs: { tile: number; face: number; d: number }[] = [];
    colours.forEach((c, tile) => {
      if (tile % 9 === 4) return;
      centres.forEach((centre, face) => pairs.push({ tile, face, d: colourDistance(c, centre) }));
    });
    pairs.sort((a, b) => a.d - b.d);

    const next: Face[] = colours.map((_, tile) => (tile % 9 === 4 ? FACES[Math.floor(tile / 9)] : (undefined as unknown as Face)));
    const room = FACES.map(() => 8);
    for (const { tile, face } of pairs) {
      if (next[tile] || !room[face]) continue;
      next[tile] = FACES[face];
      room[face]--;
    }
    labels = next;
    centres = FACES.map((f) => average(colours.filter((_, t) => labels[t] === f)));
  }

  if (problems(labels).length === 0) return labels;
  const fit = (tile: number, face: Face) => colourDistance(colours[tile], centres[FACES.indexOf(face)]);

  const singles = singleFixes(labels);
  if (singles.length) {
    const best = singles.reduce((a, b) => (fit(a.facelet, a.face) <= fit(b.facelet, b.face) ? a : b));
    labels[best.facelet] = best.face;
    return labels;
  }
  const swaps = swapFixes(labels);
  if (swaps.length) {
    const cost = ([a, b]: [number, number]) => fit(a, labels[b]) + fit(b, labels[a]) - fit(a, labels[a]) - fit(b, labels[b]);
    const [a, b] = swaps.reduce((x, y) => (cost(x) <= cost(y) ? x : y));
    [labels[a], labels[b]] = [labels[b], labels[a]];
  }
  return labels;
}
