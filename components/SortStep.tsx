"use client";

import { Wand2 } from "lucide-react";
import { useMemo, useState } from "react";

import { FaceGrid } from "@/components/FaceGrid";
import { Button } from "@/components/ui/button";
import { autosort } from "@/lib/autosort";
import { FACES, type Face } from "@/lib/cube";
import { problems, singleFixes, swapFixes, type Problem } from "@/lib/pieces";
import { FACE_START, SIDE_COLOUR, SIDE_NAME } from "@/lib/sides";
import type { Tile } from "@/lib/tiles";
import { cn } from "@/lib/utils";

type Props = { tiles: Tile[]; labels: Face[]; onLabels: (labels: Face[]) => void; onBack: () => void; onNext: () => void };

/** Cube net positions: top above front, left/front/right/back across, bottom below. */
const NET: { face: Face; col: number; row: number }[] = [
  { face: "U", col: 2, row: 1 },
  { face: "L", col: 1, row: 2 },
  { face: "F", col: 2, row: 2 },
  { face: "R", col: 3, row: 2 },
  { face: "B", col: 4, row: 2 },
  { face: "D", col: 2, row: 3 },
];

function message(p: Problem) {
  switch (p.kind) {
    case "count":
      return `${SIDE_NAME[p.face]} has ${p.count} tiles marked, not 9.`;
    case "piece":
      return "The flashing tiles share a piece, but no real piece has that mix of sides.";
    case "repeat":
      return "The flashing tiles make a piece that appears twice.";
    case "twist":
      return "Every piece is accounted for, but one corner would need twisting in place. Two tiles on a corner are probably mixed up.";
    case "flip":
      return "Every piece is accounted for, but one edge would need flipping in place. The two tiles on an edge are probably mixed up.";
    case "swap":
      return "Every piece is accounted for, but two would need swapping without anything else moving. Check for two tiles with each other's sides.";
  }
}

export function SortStep({ tiles, labels, onLabels, onBack, onNext }: Props) {
  const [brush, setBrush] = useState<Face>("F");
  const found = useMemo(() => problems(labels), [labels]);
  const fixes = useMemo(() => (found.length ? singleFixes(labels) : []), [found, labels]);
  const swaps = useMemo(() => (found.length && !fixes.length ? swapFixes(labels) : []), [found, fixes, labels]);

  const flashing = new Set<number>();
  for (const p of found) if (p.kind === "piece" || p.kind === "repeat") p.facelets.forEach((f) => flashing.add(f));
  if (fixes.length === 1) flashing.add(fixes[0].facelet);
  if (swaps.length === 1) swaps[0].forEach((f) => flashing.add(f));

  const paint = (facelet: number) => {
    if (facelet % 9 === 4) return;
    const next = [...labels];
    next[facelet] = brush;
    onLabels(next);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Sort the tiles</h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            Mark which side each tile belongs on. Each centre stays put, so its picture tells you the side. Pick a side below, then tap tiles.
          </p>
        </div>
        <Button variant="outline" onClick={() => onLabels(autosort(tiles.map((t) => t.colours)))}>
          <Wand2 />
          Guess from colours
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Side to mark">
        {FACES.map((face) => {
          const count = labels.filter((l) => l === face).length;
          return (
            <button
              key={face}
              type="button"
              role="radio"
              aria-checked={brush === face}
              onClick={() => setBrush(face)}
              className={cn("flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm", brush === face ? "border-foreground bg-muted" : "hover:bg-muted/60")}
            >
              <span className="size-7 rounded bg-cover bg-center" style={{ backgroundImage: `url(${tiles[FACE_START[face] + 4].image})`, boxShadow: `0 0 0 2px ${SIDE_COLOUR[face]}` }} />
              <span className="font-medium">{SIDE_NAME[face]}</span>
              <span className={cn("tabular-nums", count === 9 ? "text-muted-foreground" : "text-red-600")}>{count}/9</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {NET.map(({ face, col, row }) => (
          <div key={face} style={{ gridColumn: col, gridRow: row }}>
            <FaceGrid
              label={`${SIDE_NAME[face]} side`}
              images={tiles.slice(FACE_START[face], FACE_START[face] + 9).map((t) => t.image)}
              outline={labels.slice(FACE_START[face], FACE_START[face] + 9).map((l) => SIDE_COLOUR[l])}
              highlight={new Set([...flashing].filter((f) => f >= FACE_START[face] && f < FACE_START[face] + 9).map((f) => f - FACE_START[face]))}
              onTile={(i) => paint(FACE_START[face] + i)}
            />
          </div>
        ))}
      </div>

      <div aria-live="polite" className="space-y-2">
        {found.length === 0 ? (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">This is a real cube position. Next, check the centres.</p>
        ) : (
          <div className="space-y-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-50">
            <ul className="list-disc space-y-1 pl-4">
              {found.slice(0, 4).map((p, i) => (
                <li key={i}>{message(p)}</li>
              ))}
            </ul>
            {fixes.length === 1 && (
              <p className="flex flex-wrap items-center gap-2">
                Changing the flashing tile to {SIDE_NAME[fixes[0].face]} would fix it.
                <Button size="sm" variant="outline" onClick={() => onLabels(Object.assign([...labels], { [fixes[0].facelet]: fixes[0].face }))}>
                  Change it
                </Button>
              </p>
            )}
            {swaps.length === 1 && (
              <p className="flex flex-wrap items-center gap-2">
                Swapping the sides of the two flashing tiles would fix it.
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const [a, b] = swaps[0];
                    onLabels(Object.assign([...labels], { [a]: labels[b], [b]: labels[a] }));
                  }}
                >
                  Swap them
                </Button>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to photos
        </Button>
        <Button size="lg" disabled={found.length > 0} onClick={onNext}>
          Check the centres
        </Button>
      </div>
    </section>
  );
}
