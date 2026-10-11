import { cn } from "@/lib/utils";

type Props = {
  images: (string | undefined)[];
  /** Quarter turns clockwise to show each tile at. */
  turns?: number[];
  /** Coloured outline per tile, e.g. the side it has been sorted into. */
  outline?: (string | undefined)[];
  highlight?: Set<number>;
  onTile?: (index: number) => void;
  className?: string;
  label?: string;
};

/** A 3x3 face drawn from tile photos. */
export function FaceGrid({ images, turns, outline, highlight, onTile, className, label }: Props) {
  return (
    <div role={onTile ? "group" : "img"} aria-label={label} className={cn("grid grid-cols-3 gap-0.5 rounded-md bg-neutral-900 p-0.5", className)}>
      {images.map((image, i) => {
        const tile = (
          <span
            className="block aspect-square size-full rounded-[3px] bg-neutral-700 bg-cover bg-center"
            style={{ backgroundImage: image ? `url(${image})` : undefined, transform: turns?.[i] ? `rotate(${turns[i] * 90}deg)` : undefined }}
          />
        );
        const ring = outline?.[i] ? { boxShadow: `inset 0 0 0 3px ${outline[i]}` } : undefined;
        return onTile ? (
          <button
            key={i}
            type="button"
            onClick={() => onTile(i)}
            className={cn("relative overflow-hidden rounded-[3px] outline-offset-1 focus-visible:outline-2 focus-visible:outline-ring", highlight?.has(i) && "animate-pulse")}
          >
            {tile}
            <span className="pointer-events-none absolute inset-0 rounded-[3px]" style={ring} />
            {highlight?.has(i) && <span className="pointer-events-none absolute inset-0 rounded-[3px] ring-3 ring-red-500 ring-inset" />}
          </button>
        ) : (
          <span key={i} className="relative overflow-hidden rounded-[3px]">
            {tile}
            <span className="pointer-events-none absolute inset-0 rounded-[3px]" style={ring} />
          </span>
        );
      })}
    </div>
  );
}
