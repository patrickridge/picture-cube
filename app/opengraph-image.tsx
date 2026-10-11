import { ImageResponse } from "next/og";

import { CubeMark } from "./cube-mark";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Picture cube solver: photograph a picture cube and get the moves.";

// Preview image for shared links.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f8fafc", color: "#0f172a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36, fontWeight: 600 }}>
          <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "#2563eb", borderRadius: 14 }}>
            <CubeMark size={44} colour="white" />
          </div>
          Picture cube solver
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>Solve a picture cube</div>
          <div style={{ fontSize: 34, color: "#475569", lineHeight: 1.35 }}>
            Photograph each side, check the tiles, and follow the moves, with every centre the right way up.
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#2563eb", fontWeight: 600 }}>Runs in your browser · photos never uploaded</div>
      </div>
    ),
    size,
  );
}
