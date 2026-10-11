import type { Face } from "./cube";

export const SIDE_NAME: Record<Face, string> = { U: "Top", R: "Right", F: "Front", D: "Bottom", L: "Left", B: "Back" };

/** Marker colour for each side while sorting tiles (the pictures themselves have no colour scheme). */
export const SIDE_COLOUR: Record<Face, string> = {
  U: "#f59e0b",
  R: "#3b82f6",
  F: "#22c55e",
  D: "#a855f7",
  L: "#ef4444",
  B: "#64748b",
};

/** Photo order and how to hold the cube for each, so tiles land in the solver's facelet order. */
export const PHOTOS: { face: Face; how: string }[] = [
  { face: "F", how: "Hold the cube with any side facing you. That side is the front, and whatever is on top stays on top throughout." },
  { face: "R", how: "Turn the whole cube a quarter turn to the left, so the right side faces you." },
  { face: "B", how: "Another quarter turn to the left: the back faces you." },
  { face: "L", how: "One more quarter turn to the left: the left side faces you." },
  { face: "U", how: "Turn back to the front, then tip the top towards you. The front should be at the bottom of the photo." },
  { face: "D", how: "Tip it back, then tip the bottom up towards you. The front should be at the top of the photo." },
];

export const FACE_START: Record<Face, number> = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 };
