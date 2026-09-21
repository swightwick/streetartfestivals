import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/festivals";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // General crawlers. Content Signals: stay searchable and let AI
      // assistants use this data to answer questions live, but don't allow
      // it to be used for training AI models.
      {
        userAgent: "*",
        allow: "/",
        other: { "Content-Signal": "search=yes, ai-input=yes, ai-train=no" },
      },
      // AI crawlers/agents — explicitly allowed so festival + hotel data
      // stays discoverable by assistants and answer engines.
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "anthropic-ai",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "Bytespider",
          "CCBot",
          "Amazonbot",
        ],
        allow: "/",
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl("/"),
  };
}
