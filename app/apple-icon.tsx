import { ImageResponse } from "next/og";

import { CubeMark } from "./cube-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon on iPhones; iOS rounds the corners itself.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#2563eb" }}>
        <CubeMark size={124} colour="white" />
      </div>
    ),
    size,
  );
}
