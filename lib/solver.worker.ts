// Runs the solver off the main thread. Several of these run at once with different seeds,
// and the page keeps the shortest answer.

import { type CentreNeeds, solve } from "./solve";

self.onmessage = (event: MessageEvent<{ facelets: string; needs: CentreNeeds; seed: number }>) => {
  const { facelets, needs, seed } = event.data;
  self.postMessage({ moves: solve(facelets, needs, { timeMs: 1500, seed }) });
};
