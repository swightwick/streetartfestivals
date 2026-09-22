import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        <svg width="92" height="78" viewBox="0 0 100 86">
          <path d="M50 0 L100 86 L0 86 Z" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
