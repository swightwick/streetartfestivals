import { NextRequest, NextResponse } from "next/server";
import { getAllFestivals, getFestival, sortedFestivals } from "@/lib/festivals";
import { estimateMarkdownTokens, festivalToMarkdown, homepageToMarkdown } from "@/lib/markdown";

export const config = {
  matcher: ["/", "/festivals/:id*"],
};

function wantsMarkdown(req: NextRequest): boolean {
  return (req.headers.get("accept") ?? "").includes("text/markdown");
}

export function proxy(req: NextRequest) {
  if (!wantsMarkdown(req)) return NextResponse.next();

  const { pathname } = req.nextUrl;
  let markdown: string | null = null;

  if (pathname === "/") {
    markdown = homepageToMarkdown(sortedFestivals(getAllFestivals()));
  } else {
    const match = pathname.match(/^\/festivals\/([^/]+)\/?$/);
    const f = match ? getFestival(match[1]) : undefined;
    if (f) markdown = festivalToMarkdown(f);
  }

  if (markdown === null) return NextResponse.next();

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(estimateMarkdownTokens(markdown)),
      Vary: "Accept",
    },
  });
}
