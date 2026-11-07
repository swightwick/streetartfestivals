import { NextRequest, NextResponse } from "next/server";
import { getAllFestivals, getFestival, sortedFestivals } from "@/lib/festivals";
import { estimateMarkdownTokens, festivalToMarkdown, homepageToMarkdown } from "@/lib/markdown";

export const config = {
  // Static assets, API routes, and metadata files are excluded so the
  // markdown negotiation below never runs against them.
  matcher: [
    "/((?!api|_next/static|_next/image|.well-known|favicon.ico|robots.txt|sitemap.xml|manifest|llms.txt|icon.svg|apple-icon|opengraph-image).*)",
  ],
};

function wantsMarkdown(req: NextRequest): boolean {
  return (req.headers.get("accept") ?? "").includes("text/markdown");
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!wantsMarkdown(req)) return NextResponse.next();
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
