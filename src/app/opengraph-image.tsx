import { ImageResponse } from "next/og";
import { SITE } from "@/lib/festivals";

export const alt = `${SITE.name} — UK & Ireland street art festival guide`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#3e2a47";
const ACCENT = "#ff9700";
const TEXT = "#dfd0b8";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: BG,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: -0.5,
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 28,
          }}
        >
          streetart<span style={{ color: TEXT }}>festivals</span>uk
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            color: "#ffffff",
            maxWidth: 980,
          }}
        >
          UK &amp; Ireland street art &amp; graffiti festivals
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            lineHeight: 1.4,
            color: TEXT,
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          {SITE.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
