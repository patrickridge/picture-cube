"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { centredSquare, type Quad, squareToQuad } from "@/lib/perspective";
import { cutTiles, type Tile } from "@/lib/tiles";

type Props = { url: string; onDone: (tiles: Tile[]) => void; onCancel: () => void };

/** Shows a photo with a grid whose four corners you drag onto the face's corners, then cuts it into nine straightened tiles. */
export function Cropper({ url, onDone, onCancel }: Props) {
  const image = useRef<HTMLImageElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>();
  const [quad, setQuad] = useState<Quad>();
  const dragging = useRef<number | null>(null);

  const onLoad = () => {
    const img = image.current!;
    setSize({ w: img.naturalWidth, h: img.naturalHeight });
    setQuad(centredSquare(img.naturalWidth, img.naturalHeight));
  };

  /** Pointer position in the photo's own pixels. */
  const toPhoto = (e: React.PointerEvent) => {
    const box = svg.current!.getBoundingClientRect();
    return {
      x: Math.min(size!.w, Math.max(0, ((e.clientX - box.left) / box.width) * size!.w)),
      y: Math.min(size!.h, Math.max(0, ((e.clientY - box.top) / box.height) * size!.h)),
    };
  };

  // Grid lines through the perspective map, so they follow the tiles in a tilted photo.
  const lines: string[] = [];
  if (quad) {
    const map = squareToQuad(quad);
    for (const t of [1 / 3, 2 / 3]) {
      const [a, b, c, d] = [map(t, 0), map(t, 1), map(0, t), map(1, t)];
      lines.push(`M${a.x} ${a.y}L${b.x} ${b.y}`, `M${c.x} ${c.y}L${d.x} ${d.y}`);
    }
  }
  const handle = size ? Math.min(size.w, size.h) * 0.035 : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Drag the four corners onto the corners of the face. The grid follows, so check its lines sit on the gaps between tiles.</p>
      <div className="relative mx-auto w-full max-w-md touch-none select-none overflow-hidden rounded-lg bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element -- a local photo, not something to optimise */}
        <img ref={image} src={url} alt="Your photo" onLoad={onLoad} className="block w-full" draggable={false} />
        {size && quad && (
          <svg
            ref={svg}
            viewBox={`0 0 ${size.w} ${size.h}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            onPointerMove={(e) => {
              const corner = dragging.current;
              if (corner === null) return;
              const p = toPhoto(e);
              setQuad((q) => q!.map((c, i) => (i === corner ? p : c)) as Quad);
            }}
            onPointerUp={() => (dragging.current = null)}
            onPointerLeave={() => (dragging.current = null)}
          >
            <path d={`M0 0H${size.w}V${size.h}H0Z M${quad.map((p) => `${p.x} ${p.y}`).join("L")}Z`} fill="rgba(0,0,0,0.45)" fillRule="evenodd" />
            <path d={`M${quad.map((p) => `${p.x} ${p.y}`).join("L")}Z`} fill="none" stroke="white" strokeWidth={handle * 0.12} />
            <path d={lines.join("")} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={handle * 0.08} />
            {quad.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={handle}
                fill="rgba(37,99,235,0.85)"
                stroke="white"
                strokeWidth={handle * 0.15}
                className="cursor-grab"
                aria-label={["Top left corner", "Top right corner", "Bottom right corner", "Bottom left corner"][i]}
                onPointerDown={(e) => {
                  dragging.current = i;
                  try {
                    (e.target as Element).setPointerCapture(e.pointerId); // keep the drag if the finger leaves the handle
                  } catch {}
                }}
              />
            ))}
          </svg>
        )}
      </div>
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="ghost" disabled={!size} onClick={() => setQuad(centredSquare(size!.w, size!.h))}>
          Reset
        </Button>
        <Button disabled={!quad} onClick={() => onDone(cutTiles(image.current!, quad!))}>
          Use this face
        </Button>
      </div>
    </div>
  );
}
