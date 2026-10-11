"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cutTiles, type Tile } from "@/lib/tiles";

type Props = { url: string; onDone: (tiles: Tile[]) => void; onCancel: () => void };

/** Shows a photo with a square to drag over the face, then cuts it into nine tiles. */
export function Cropper({ url, onDone, onCancel }: Props) {
  const image = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number }>();
  // Square in image pixels.
  const [square, setSquare] = useState({ x: 0, y: 0, size: 0 });
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  const onLoad = () => {
    const img = image.current!;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const size = Math.min(w, h) * 0.7;
    setNatural({ w, h });
    setSquare({ x: (w - size) / 2, y: (h - size) / 2, size });
  };

  const scale = () => (natural && image.current ? natural.w / image.current.clientWidth : 1);
  const clamp = (s: typeof square) => ({
    size: s.size,
    x: Math.min(Math.max(s.x, 0), natural!.w - s.size),
    y: Math.min(Math.max(s.y, 0), natural!.h - s.size),
  });

  const setSize = (fraction: number) => {
    const size = Math.min(natural!.w, natural!.h) * fraction;
    const cx = square.x + square.size / 2;
    const cy = square.y + square.size / 2;
    setSquare(clamp({ size, x: cx - size / 2, y: cy - size / 2 }));
  };

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Drag the square so its grid lines sit on the lines between tiles. Use the slider to resize it.</p>
      <div className="relative mx-auto w-full max-w-md touch-none select-none overflow-hidden rounded-lg bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element -- a local photo, not something to optimise */}
        <img ref={image} src={url} alt="Your photo" onLoad={onLoad} className="block w-full" draggable={false} />
        {natural && (
          <div
            className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
            style={{ left: pct(square.x, natural.w), top: pct(square.y, natural.h), width: pct(square.size, natural.w), height: pct(square.size, natural.h) }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { px: e.clientX, py: e.clientY, x: square.x, y: square.y };
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const k = scale();
              setSquare(clamp({ size: square.size, x: drag.current.x + (e.clientX - drag.current.px) * k, y: drag.current.y + (e.clientY - drag.current.py) * k }));
            }}
            onPointerUp={() => (drag.current = null)}
          >
            <div className="grid size-full grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="border border-white/70" />
              ))}
            </div>
          </div>
        )}
      </div>
      {natural && (
        <label className="mx-auto flex max-w-md items-center gap-3 text-sm">
          <span className="text-muted-foreground">Size</span>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.01}
            value={square.size / Math.min(natural.w, natural.h)}
            onChange={(e) => setSize(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
        </label>
      )}
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!natural} onClick={() => onDone(cutTiles(image.current!, square))}>
          Use this face
        </Button>
      </div>
    </div>
  );
}
