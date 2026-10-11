// Turns written as the person holding the cube sees them: front facing them, top on top.

import type { Move } from "./cube";

const WORDS: Record<string, { layer: string; turn: string }> = {
  U: { layer: "Top layer", turn: "front goes left" },
  "U'": { layer: "Top layer", turn: "front goes right" },
  D: { layer: "Bottom layer", turn: "front goes right" },
  "D'": { layer: "Bottom layer", turn: "front goes left" },
  R: { layer: "Right side", turn: "front goes up" },
  "R'": { layer: "Right side", turn: "front goes down" },
  L: { layer: "Left side", turn: "front goes down" },
  "L'": { layer: "Left side", turn: "front goes up" },
  F: { layer: "Front face", turn: "clockwise" },
  "F'": { layer: "Front face", turn: "anticlockwise" },
  B: { layer: "Back face", turn: "top goes left" },
  "B'": { layer: "Back face", turn: "top goes right" },
};

export function describe(move: Move) {
  if (move.endsWith("2")) return { layer: WORDS[move[0]].layer, turn: "half turn" };
  return WORDS[move];
}

/** Splits moves into small groups, so a slip shows up at the next check rather than at the end. */
export function groups(moves: Move[], size = 4): Move[][] {
  const out: Move[][] = [];
  for (let i = 0; i < moves.length; i += size) out.push(moves.slice(i, i + size));
  // Avoid a lonely last move.
  if (out.length > 1 && out.at(-1)!.length === 1) out.at(-2)!.push(...out.pop()!);
  return out;
}
