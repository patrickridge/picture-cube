import { ImageResponse } from "next/og";

import { CubeMark } from "./cube-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#2563eb", borderRadius: 7 }}>
        <CubeMark size={24} colour="white" />
      </div>
    ),
    size,
  );
}
