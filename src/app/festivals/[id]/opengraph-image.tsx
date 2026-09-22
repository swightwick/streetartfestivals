import { ImageResponse } from "next/og";
import { getAllFestivals, getFestival, SITE } from "@/lib/festivals";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllFestivals().map((f) => ({ id: f.id }));
}

const BG = "#3e2a47";
const ACCENT = "#ff9700";
const TEXT = "#dfd0b8";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = getFestival(id);

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
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: -0.5,
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 36,
          }}
        >
          streetart<span style={{ color: TEXT }}>festivals</span>uk
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            color: "#ffffff",
            maxWidth: 1000,
          }}
        >
          {f?.name ?? SITE.name}
        </div>
        {f && (
          <div
            style={{
              display: "flex",
              fontSize: 32,
              fontWeight: 600,
              color: ACCENT,
              marginTop: 24,
            }}
          >
            {f.city} · {f.dateShort}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
