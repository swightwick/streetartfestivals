import { siteUrl } from "@/lib/festivals";

export const dynamic = "force-static";

// API catalog for automated discovery (RFC 9727).
// https://www.rfc-editor.org/rfc/rfc9727
export function GET() {
  const catalog = {
    linkset: [
      {
        anchor: siteUrl("/api/festivals"),
        "service-desc": [
          { href: siteUrl("/api/openapi.json"), type: "application/vnd.oai.openapi+json" },
        ],
        "service-doc": [{ href: siteUrl("/llms.txt"), type: "text/markdown" }],
        status: [{ href: siteUrl("/api/status"), type: "application/json" }],
      },
    ],
  };

  return new Response(JSON.stringify(catalog), {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
