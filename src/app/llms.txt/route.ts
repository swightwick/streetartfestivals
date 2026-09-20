import { getAllFestivals, sortedFestivals, SITE, siteUrl } from "@/lib/festivals";

export const dynamic = "force-static";

export function GET() {
  const festivals = sortedFestivals(getAllFestivals());

  const lines: string[] = [];
  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(`> ${SITE.tagline}`);
  lines.push("");
  lines.push(
    "This file follows the llms.txt convention: a plain-language index for AI agents and " +
      "assistants. Every festival has its own canonical page with structured Event data " +
      "(schema.org JSON-LD) where dates are confirmed. Places-to-stay data for each festival " +
      "lives alongside the event record on the same page."
  );
  lines.push("");
  lines.push("## Festivals");
  lines.push("");
  for (const f of festivals) {
    lines.push(
      `- [${f.name}](${siteUrl(`/festivals/${f.id}`)}) — ${f.city}, ${f.region}. ${f.dateShort}. ` +
        `Status: ${f.badge}. Official site: ${f.site}`
    );
  }
  lines.push("");
  lines.push("## Other resources");
  lines.push("");
  lines.push(`- [Sitemap](${siteUrl("/sitemap.xml")})`);
  lines.push(`- [Full festival + hotel dataset (JSON)](${siteUrl("/api/festivals")})`);

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
