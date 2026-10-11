import type { Move } from "@/lib/cube";

/** The front of the cube with the layer that turns shaded and an arrow for the direction. */
export function MoveIcon({ move, size = 56 }: { move: Move; size?: number }) {
  const face = move[0];
  const prime = move.endsWith("'");
  const half = move.endsWith("2");
  const cells = Array.from({ length: 9 }, (_, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const on =
      face === "F" ||
      (face === "U" && row === 0) ||
      (face === "D" && row === 2) ||
      (face === "L" && col === 0) ||
      (face === "R" && col === 2);
    return { x: 4 + col * 16, y: 4 + row * 16, on };
  });

  // Arrow direction on the front, as the person holding the cube sees it.
  const arrows: Record<string, string> = {
    U: "M44 12 H12", "U'": "M12 12 H44",
    D: "M12 44 H44", "D'": "M44 44 H12",
    R: "M44 44 V12", "R'": "M44 12 V44",
    L: "M12 12 V44", "L'": "M12 44 V12",
    B: "M44 6 H12", "B'": "M12 6 H44",
  };
  const key = half ? face : move;

  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden className="shrink-0">
      <defs>
        <marker id="head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
      </defs>
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width={15}
          height={15}
          rx={2}
          className={c.on ? "fill-primary/80" : "fill-muted stroke-border"}
          strokeDasharray={face === "B" ? "2 2" : undefined}
        />
      ))}
      {face === "F" ? (
        <path
          d={prime ? "M40 18 A13 13 0 1 0 40 38" : "M16 18 A13 13 0 1 1 16 38"}
          fill="none"
          strokeWidth={3}
          className="stroke-foreground"
          markerEnd="url(#head)"
        />
      ) : (
        <path d={arrows[key]} fill="none" strokeWidth={3} className="stroke-foreground" markerEnd="url(#head)" />
      )}
      {half && (
        <text x={28} y={32} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
          ×2
        </text>
      )}
    </svg>
  );
}
