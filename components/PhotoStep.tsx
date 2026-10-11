"use client";

import { Camera, Check } from "lucide-react";
import { useState } from "react";

import { Cropper } from "@/components/Cropper";
import { FaceGrid } from "@/components/FaceGrid";
import { Button } from "@/components/ui/button";
import type { Face } from "@/lib/cube";
import { FACE_START, PHOTOS, SIDE_NAME } from "@/lib/sides";
import type { Tile } from "@/lib/tiles";

type Props = { tiles: (Tile | null)[]; onFace: (face: Face, tiles: Tile[]) => void; onNext: () => void };

export function PhotoStep({ tiles, onFace, onNext }: Props) {
  const [cropping, setCropping] = useState<{ face: Face; url: string } | null>(null);
  const done = (face: Face) => tiles[FACE_START[face]] !== null;
  const allDone = PHOTOS.every((p) => done(p.face));

  if (cropping) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{SIDE_NAME[cropping.face]}</h2>
        <Cropper
          url={cropping.url}
          onCancel={() => {
            URL.revokeObjectURL(cropping.url);
            setCropping(null);
          }}
          onDone={(cut) => {
            URL.revokeObjectURL(cropping.url);
            onFace(cropping.face, cut);
            setCropping(null);
          }}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Photograph each side</h2>
        <p className="text-sm text-muted-foreground">
          Six photos in good light. Hold the camera level with the side you&apos;re photographing, so the top of the cube is out of shot. Turn the whole cube between photos, never a single layer.
        </p>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2">
        {PHOTOS.map(({ face, how }, i) => (
          <li key={face} className="flex gap-4 rounded-xl border bg-card p-4">
            <div className="w-20 shrink-0">
              {done(face) ? (
                <FaceGrid images={tiles.slice(FACE_START[face], FACE_START[face] + 9).map((t) => t?.image)} label={`${SIDE_NAME[face]} photo`} />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-md border border-dashed text-2xl font-semibold text-muted-foreground">
                  {i + 1}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="flex items-center gap-1.5 font-medium">
                {SIDE_NAME[face]}
                {done(face) && <Check className="size-4 text-green-600" aria-label="done" />}
              </p>
              <p className="text-sm text-muted-foreground">{how}</p>
              <label className="inline-flex">
                <input
                  type="file"
                  accept="image/*"
                  className="peer sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) setCropping({ face, url: URL.createObjectURL(file) });
                  }}
                />
                <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-sm font-medium hover:bg-muted peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50">
                  <Camera className="size-4" />
                  {done(face) ? "Retake" : "Add photo"}
                </span>
              </label>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex justify-end">
        <Button size="lg" disabled={!allDone} onClick={onNext}>
          Sort the tiles
        </Button>
      </div>
    </section>
  );
}
