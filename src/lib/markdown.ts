import type { Festival } from "@/lib/types";
import { SITE, isPast, siteUrl } from "@/lib/festivals";

export function festivalToMarkdown(f: Festival): string {
  const lines: string[] = [];

  lines.push(`# ${f.name}`);
  lines.push("");
  lines.push(f.summary);
  lines.push("");

  lines.push("## Details");
  lines.push(`- **Dates:** ${f.dates}${isPast(f) ? " (event passed)" : ""}`);
  lines.push(`- **Location:** ${f.location} (${f.postcode})`);
  lines.push(`- **City / region:** ${f.city}, ${f.region}`);
  lines.push(`- **Frequency:** ${f.freq}`);
  lines.push(`- **Status:** ${f.statusNote}`);
  lines.push(`- **Official site:** ${f.site}`);
  lines.push("");

  if (f.prev.length > 0) {
    lines.push("## Previous editions");
    for (const p of f.prev) {
      lines.push(`- **${p.year}:** ${p.note}`);
    }
    lines.push("");
  }

  if (f.socials.length > 0) {
    lines.push("## Follow");
    for (const s of f.socials) {
      lines.push(`- [${s.label}](${s.url})`);
    }
    lines.push("");
  }

  if (f.stays.length > 0) {
    lines.push("## Places to stay nearby");
    for (const s of f.stays) {
      lines.push(`- **${s.name}** (${s.kind}) — ${s.detail}. ${s.price}, ${s.walk}.`);
    }
    lines.push("");
  }

  lines.push(`[View on ${SITE.name}](${siteUrl(`/festivals/${f.id}`)})`);

  return lines.join("\n");
}

export function homepageToMarkdown(festivals: Festival[]): string {
  const lines: string[] = [];

  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(SITE.tagline);
  lines.push("");
  lines.push("## Festivals");
  lines.push("");

  for (const f of festivals) {
    const status = isPast(f) ? "event passed" : f.badge;
    lines.push(
      `- [${f.name}](${siteUrl(`/festivals/${f.id}`)}) — ${f.city}, ${f.region} — ${f.dateShort} (${status})`
    );
  }

  return lines.join("\n");
}

export function estimateMarkdownTokens(markdown: string): number {
  // Rough heuristic (~4 chars/token); good enough for an informational header.
  return Math.ceil(markdown.length / 4);
}
