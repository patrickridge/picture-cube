// A few solver workers running side by side. Each builds the solver's tables once, then
// answers requests; searches run on all of them with different seeds.

import type { Move } from "./cube";
import type { CentreNeeds } from "./solve";

const ANY: CentreNeeds = { U: null, R: null, F: null, D: null, L: null, B: null };

let workers: Worker[] = [];

function pool() {
  if (!workers.length) {
    const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1));
    workers = Array.from({ length: n }, () => new Worker(new URL("./solver.worker.ts", import.meta.url), { type: "module" }));
  }
  return workers;
}

function ask(worker: Worker, facelets: string, needs: CentreNeeds, seed: number): Promise<Move[] | null> {
  return new Promise((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<{ moves: Move[] | null }>) => resolve(e.data.moves);
    worker.onerror = (e) => reject(e);
    worker.postMessage({ facelets, needs, seed });
  });
}

/** Start the workers building their tables, so the first real request is quick. */
export function warmUp() {
  pool();
}

/** Any solution for the pieces, ignoring centres. */
export function solvePieces(facelets: string) {
  return ask(pool()[0], facelets, ANY, 1);
}

/** The shortest solution found that also turns each centre as needed. */
export async function solveWithCentres(facelets: string, needs: CentreNeeds) {
  const answers = await Promise.all(pool().map((w, i) => ask(w, facelets, needs, i + 1)));
  return answers.filter((a): a is Move[] => a !== null).sort((a, b) => a.length - b.length)[0] ?? null;
}
