import { FaceGrid } from "@/components/FaceGrid";
import { type Face, type State } from "@/lib/cube";
import { FACE_START, SIDE_NAME } from "@/lib/sides";
import type { Tile } from "@/lib/tiles";

const NET: { face: Face; col: number; row: number }[] = [
  { face: "U", col: 2, row: 1 },
  { face: "L", col: 1, row: 2 },
  { face: "F", col: 2, row: 2 },
  { face: "R", col: 3, row: 2 },
  { face: "B", col: 4, row: 2 },
  { face: "D", col: 2, row: 3 },
];

type Props = {
  tiles: Tile[];
  /** Which photographed tile is on each facelet, and how far it has turned since the photo. */
  state: State;
  /** Extra quarter turns for each centre, e.g. while someone is setting them. */
  centreTurns?: Partial<Record<Face, number>>;
  onCentre?: (face: Face) => void;
};

/** The cube unfolded, drawn with the tile photos where `state` puts them. */
export function CubeNet({ tiles, state, centreTurns, onCentre }: Props) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
      {NET.map(({ face, col, row }) => {
        const slots = state.slice(FACE_START[face], FACE_START[face] + 9);
        const turns = slots.map((s, i) => s.turns + (i === 4 ? (centreTurns?.[face] ?? 0) : 0));
        return (
          <div key={face} style={{ gridColumn: col, gridRow: row }}>
            <FaceGrid
              label={`${SIDE_NAME[face]} side`}
              images={slots.map((s) => tiles[s.home].image)}
              turns={turns}
              onTile={onCentre ? (i) => i === 4 && onCentre(face) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
