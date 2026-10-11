"use client";

import { PartyPopper } from "lucide-react";
import { useMemo, useState } from "react";

import { CubeNet } from "@/components/CubeNet";
import { FaceGrid } from "@/components/FaceGrid";
import { MoveIcon } from "@/components/MoveIcon";
import { Button } from "@/components/ui/button";
import { applyMoves, type Move, solvedState } from "@/lib/cube";
import { describe, groups } from "@/lib/moves";
import { FACE_START } from "@/lib/sides";
import type { Tile } from "@/lib/tiles";

type Props = { tiles: Tile[]; moves: Move[]; onBack: () => void; onRestart: () => void };

export function SolveStep({ tiles, moves, onBack, onRestart }: Props) {
  const steps = useMemo(() => groups(moves), [moves]);
  const [step, setStep] = useState(0);
  const finished = step === steps.length;

  // The cube after each group, starting from how it was photographed.
  const after = useMemo(() => {
    const states = [];
    let state = solvedState();
    for (const g of steps) states.push((state = applyMoves(state, g)));
    return states;
  }, [steps]);

  const face = (index: number, at: number) => {
    const slots = after[index].slice(at, at + 9);
    return { images: slots.map((s) => tiles[s.home].image), turns: slots.map((s) => s.turns) };
  };

  if (finished) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <PartyPopper className="size-6 text-primary" />
          <h2 className="text-lg font-semibold">Solved</h2>
        </div>
        <p className="text-sm text-muted-foreground">Your cube should now look like this, centres and all.</p>
        <CubeNet tiles={tiles} state={after.at(-1)!} />
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(steps.length - 1)}>
            Back a step
          </Button>
          <Button onClick={onRestart}>Solve another</Button>
        </div>
      </section>
    );
  }

  const front = face(step, FACE_START.F);
  const top = face(step, FACE_START.U);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length} · {moves.length} moves in all
          </p>
          <h2 className="text-lg font-semibold">Hold it as in your first photo: front facing you, top on top</h2>
        </div>
        <div className="flex h-2 w-40 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="bg-primary transition-all" style={{ width: `${(step / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <ol className="space-y-2">
          {steps[step].map((move, i) => {
            const { layer, turn } = describe(move);
            return (
              <li key={i} className="flex items-center gap-4 rounded-xl border bg-card p-3">
                <MoveIcon move={move} />
                <div>
                  <p className="font-medium">
                    {layer}: {turn}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{move}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="space-y-2">
          <p className="text-sm font-medium">Then check: front and top should look like this</p>
          <div className="flex gap-3">
            <figure className="w-32 space-y-1">
              <FaceGrid {...front} label="Front after these moves" />
              <figcaption className="text-center text-xs text-muted-foreground">Front</figcaption>
            </figure>
            <figure className="w-32 space-y-1">
              <FaceGrid {...top} label="Top after these moves" />
              <figcaption className="text-center text-xs text-muted-foreground">Top, front edge at the bottom</figcaption>
            </figure>
          </div>
          <p className="max-w-64 text-xs text-muted-foreground">If it doesn&apos;t match, a move went the wrong way. Take new photos and start again from there.</p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={step === 0 ? onBack : () => setStep(step - 1)}>
          {step === 0 ? "Back to centres" : "Previous step"}
        </Button>
        <Button size="lg" onClick={() => setStep(step + 1)}>
          {step === steps.length - 1 ? "Done" : "Next step"}
        </Button>
      </div>
    </section>
  );
}
