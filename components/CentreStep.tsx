"use client";

import { RotateCcw, RotateCw } from "lucide-react";

import { CubeNet } from "@/components/CubeNet";
import { Button } from "@/components/ui/button";
import { FACES, type Face, type State } from "@/lib/cube";
import { SIDE_NAME } from "@/lib/sides";
import type { Tile } from "@/lib/tiles";
import { cn } from "@/lib/utils";

type Props = {
  tiles: Tile[];
  /** The solved cube, if the centres are left as they are. */
  solved: State;
  taps: Record<Face, number>;
  plain: Record<Face, boolean>;
  onTap: (face: Face, quarterTurns: number) => void;
  onPlain: (face: Face) => void;
  error?: string;
  busy: boolean;
  onBack: () => void;
  onNext: () => void;
};

export function CentreStep({ tiles, solved, taps, plain, onTap, onPlain, error, busy, onBack, onNext }: Props) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Your cube, solved</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          This is how your tiles fit together. The centres can end up turned any way, so tap each centre until its picture lines up with the tiles around it.
        </p>
      </div>

      <CubeNet tiles={tiles} state={solved} centreTurns={taps} onCentre={(face) => onTap(face, 1)} />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {FACES.map((face) => (
          <div key={face} className="flex items-center gap-2 rounded-lg border py-2 pr-3 pl-4 text-sm">
            <span className="flex-1 font-medium">{SIDE_NAME[face]}</span>
            <Button size="icon-sm" variant="outline" aria-label={`Turn the ${SIDE_NAME[face].toLowerCase()} centre anticlockwise`} disabled={plain[face]} onClick={() => onTap(face, 3)}>
              <RotateCcw />
            </Button>
            <Button size="icon-sm" variant="outline" aria-label={`Turn the ${SIDE_NAME[face].toLowerCase()} centre clockwise`} disabled={plain[face]} onClick={() => onTap(face, 1)}>
              <RotateCw />
            </Button>
            <label className={cn("ml-2 flex items-center gap-1.5 text-xs whitespace-nowrap", plain[face] ? "text-foreground" : "text-muted-foreground")}>
              <input type="checkbox" checked={plain[face]} onChange={() => onPlain(face)} className="accent-primary" />
              Any way up
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Tick &ldquo;any way up&rdquo; for a plain centre that looks the same turned. It gives the solver more freedom.</p>

      {error && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-50">{error}</p>}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to sorting
        </Button>
        <Button size="lg" disabled={busy} onClick={onNext}>
          {busy ? "Finding the moves…" : "Show me the moves"}
        </Button>
      </div>
    </section>
  );
}
