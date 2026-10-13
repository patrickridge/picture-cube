"use client";

import { useEffect, useMemo, useState } from "react";

import { CentreStep } from "@/components/CentreStep";
import { PhotoStep } from "@/components/PhotoStep";
import { SolveStep } from "@/components/SolveStep";
import { SortStep } from "@/components/SortStep";
import { Button } from "@/components/ui/button";
import { autosort } from "@/lib/autosort";
import { applyMoves, centreTurns, FACES, type Face, faceOf, type Move, solvedState } from "@/lib/cube";
import { demoTiles } from "@/lib/demo";
import { problems } from "@/lib/pieces";
import { solvePieces, solveWithCentres, warmUp } from "@/lib/pool";
import { FACE_START } from "@/lib/sides";
import type { CentreNeeds } from "@/lib/solve";
import type { Tile } from "@/lib/tiles";
import { cn } from "@/lib/utils";

type Step = "photos" | "sort" | "centres" | "solve";
const STEPS: { id: Step; name: string }[] = [
  { id: "photos", name: "Photos" },
  { id: "sort", name: "Sort tiles" },
  { id: "centres", name: "Centres" },
  { id: "solve", name: "Moves" },
];

const zero = () => ({ U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 });
const no = () => ({ U: false, R: false, F: false, D: false, L: false, B: false });
const startLabels = (): Face[] => Array.from({ length: 54 }, (_, i) => faceOf(i));

const SAVE_KEY = "picture-cube-v2"; // bumped when the saved tile format changes
type Saved = { tiles: (Tile | null)[]; labels: Face[] };

export function CubeSolver() {
  const [step, setStep] = useState<Step>("photos");
  const [tiles, setTiles] = useState<(Tile | null)[]>(() => new Array(54).fill(null));
  const [labels, setLabels] = useState<Face[]>(startLabels);
  const [pieceMoves, setPieceMoves] = useState<Move[] | null>(null);
  const [taps, setTaps] = useState<Record<Face, number>>(zero);
  const [plain, setPlain] = useState<Record<Face, boolean>>(no);
  const [moves, setMoves] = useState<Move[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  // Keep photos and sorting if the page is reloaded mid-solve.
  useEffect(() => {
    try {
      const saved: Saved | null = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
      if (saved?.tiles?.length === 54) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring browser storage after hydration
        setTiles(saved.tiles);
        setLabels(saved.labels);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ tiles, labels } satisfies Saved));
    } catch {}
  }, [tiles, labels]);

  const complete = tiles.every(Boolean) ? (tiles as Tile[]) : null;
  const facelets = labels.join("");
  const solved = useMemo(() => (pieceMoves ? applyMoves(solvedState(), pieceMoves) : null), [pieceMoves]);

  const goSort = () => {
    warmUp();
    if (labels.every((l, i) => l === faceOf(i)) && complete) setLabels(autosort(complete.map((t) => t.colours)));
    setStep("sort");
  };

  const goCentres = async () => {
    if (problems(labels).length) return;
    setBusy(true);
    setError(undefined);
    const found = await solvePieces(facelets);
    setPieceMoves(found);
    setTaps(zero());
    setBusy(false);
    setStep("centres");
  };

  const goSolve = async () => {
    const turned = centreTurns(pieceMoves!);
    const needs = Object.fromEntries(FACES.map((f) => [f, plain[f] ? null : (turned[f] + taps[f]) % 4])) as CentreNeeds;
    setBusy(true);
    setError(undefined);
    const found = await solveWithCentres(facelets, needs);
    setBusy(false);
    if (!found) {
      setError(
        "A real cube can't have just these centres turned: centres turn in pairs. One of them is probably a quarter turn out. Check the one you're least sure of, or tick “any way up” on a plain centre.",
      );
      return;
    }
    setMoves(found);
    setStep("solve");
  };

  const tryExample = () => {
    const example = demoTiles();
    setTiles(example);
    setLabels(startLabels());
    setPieceMoves(null);
    setMoves(null);
    setStep("photos");
  };

  const restart = () => {
    setTiles(new Array(54).fill(null));
    setLabels(startLabels());
    setPieceMoves(null);
    setMoves(null);
    setTaps(zero());
    setPlain(no());
    setStep("photos");
  };

  const reachable: Record<Step, boolean> = { photos: true, sort: !!complete, centres: !!solved, solve: !!moves };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Progress">
          <ol className="flex flex-wrap gap-1 text-sm">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={!reachable[s.id] || busy}
                  onClick={() => (s.id === "sort" ? goSort() : setStep(s.id))}
                  aria-current={step === s.id ? "step" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1",
                    step === s.id ? "bg-foreground text-background" : "text-muted-foreground enabled:hover:bg-muted disabled:opacity-50",
                  )}
                >
                  {i + 1}. {s.name}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={tryExample}>
            Try an example cube
          </Button>
          {tiles.some(Boolean) && (
            <Button variant="ghost" size="sm" onClick={restart}>
              Start over
            </Button>
          )}
        </div>
      </div>

      {step === "photos" && (
        <PhotoStep
          tiles={tiles}
          onFace={(face, cut) => {
            const next = [...tiles];
            next.splice(FACE_START[face], 9, ...cut);
            setTiles(next);
            setLabels(startLabels());
          }}
          onNext={goSort}
        />
      )}
      {step === "sort" && complete && (
        <SortStep tiles={complete} labels={labels} onLabels={setLabels} onBack={() => setStep("photos")} onNext={goCentres} />
      )}
      {step === "sort" && busy && <p className="text-sm text-muted-foreground">Working out how your tiles fit together…</p>}
      {step === "centres" && complete && solved && (
        <CentreStep
          tiles={complete}
          solved={solved}
          taps={taps}
          plain={plain}
          onTap={(f, q) => setTaps((t) => ({ ...t, [f]: (t[f] + q) % 4 }))}
          onPlain={(f) => setPlain((p) => ({ ...p, [f]: !p[f] }))}
          error={error}
          busy={busy}
          onBack={() => setStep("sort")}
          onNext={goSolve}
        />
      )}
      {step === "solve" && complete && moves && <SolveStep tiles={complete} moves={moves} onBack={() => setStep("centres")} onRestart={restart} />}
    </div>
  );
}
