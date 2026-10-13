// An example cube for people without a picture cube to hand: six simple pictures, cut
// into tiles and scrambled with the same sticker model the solver uses.

import { applyMoves, type Move, solvedState } from "./cube";
import { fingerprint, type Tile } from "./tiles";

const PICTURES = [
  { word: "TOP", from: "#fde68a", to: "#f59e0b", ink: "#78350f" },
  { word: "RIGHT", from: "#bfdbfe", to: "#3b82f6", ink: "#1e3a8a" },
  { word: "FRONT", from: "#bbf7d0", to: "#22c55e", ink: "#14532d" },
  { word: "BASE", from: "#e9d5ff", to: "#a855f7", ink: "#581c87" },
  { word: "LEFT", from: "#fecaca", to: "#ef4444", ink: "#7f1d1d" },
  { word: "BACK", from: "#e5e7eb", to: "#6b7280", ink: "#111827" },
];

const SIZE = 480;

function drawFace(ctx: CanvasRenderingContext2D, picture: (typeof PICTURES)[number], seed: number) {
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, picture.from);
  gradient.addColorStop(1, picture.to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // A few soft circles so every tile has something to recognise.
  for (let i = 0; i < 5; i++) {
    const a = (seed * 7 + i * 53) % 360;
    ctx.beginPath();
    ctx.arc(SIZE / 2 + Math.cos(a) * SIZE * 0.32, SIZE / 2 + Math.sin(a) * SIZE * 0.32, SIZE * (0.1 + i * 0.03), 0, Math.PI * 2);
    ctx.fillStyle = `${picture.ink}${i % 2 ? "22" : "33"}`;
    ctx.fill();
  }
  ctx.fillStyle = picture.ink;
  ctx.font = `700 ${SIZE * 0.2}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(picture.word, SIZE / 2, SIZE / 2, SIZE * 0.9);
  ctx.fillRect(SIZE * 0.42, SIZE * 0.08, SIZE * 0.16, SIZE * 0.06); // a mark at the top edge
}

const SCRAMBLE = "R U2 F' L D B2 R' U F2 D' L2 B U' R2 F L'".split(" ") as Move[];

/** 54 tiles as they would be photographed after scrambling, in facelet order. */
export function demoTiles(): Tile[] {
  const face = document.createElement("canvas");
  face.width = face.height = SIZE;
  const fctx = face.getContext("2d")!;
  const tile = document.createElement("canvas");
  const t = SIZE / 3;
  tile.width = tile.height = t;
  const tctx = tile.getContext("2d", { willReadFrequently: true })!;

  const solvedTiles: HTMLCanvasElement[] = [];
  PICTURES.forEach((picture, f) => {
    drawFace(fctx, picture, f);
    for (let k = 0; k < 9; k++) {
      const c = document.createElement("canvas");
      c.width = c.height = t;
      c.getContext("2d")!.drawImage(face, (k % 3) * t, Math.floor(k / 3) * t, t, t, 0, 0, t, t);
      solvedTiles.push(c);
    }
  });

  return applyMoves(solvedState(), SCRAMBLE).map(({ home, turns }) => {
    tctx.save();
    tctx.clearRect(0, 0, t, t);
    tctx.translate(t / 2, t / 2);
    tctx.rotate((turns * Math.PI) / 2);
    tctx.drawImage(solvedTiles[home], -t / 2, -t / 2);
    tctx.restore();
    return { image: tile.toDataURL("image/jpeg", 0.85), colours: fingerprint(tctx.getImageData(0, 0, t, t).data) };
  });
}
