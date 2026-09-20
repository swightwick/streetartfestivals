import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/festivals";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // General crawlers.
      { userAgent: "*", allow: "/" },
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
