import { NextRequest, NextResponse } from "next/server";
import { getAllFestivals, getFestival, sortedFestivals } from "@/lib/festivals";
import { estimateMarkdownTokens, festivalToMarkdown, homepageToMarkdown } from "@/lib/markdown";

export const config = {
  // Broad enough to cover the holding-page rewrite below as well as the
  // markdown negotiation; static assets, API routes, and metadata files are
  // excluded so neither concern ever runs against them.
  matcher: [
    "/((?!api|_next/static|_next/image|.well-known|favicon.ico|robots.txt|sitemap.xml|manifest|llms.txt|icon.svg|apple-icon|opengraph-image).*)",
  ],
};

function wantsMarkdown(req: NextRequest): boolean {
  return (req.headers.get("accept") ?? "").includes("text/markdown");
}

// Set HOLDING_PAGE=true in the Production environment (Vercel project
// settings) to serve the "coming soon" placeholder at the live domain while
// development continues on this branch — preview deployments are unaffected
// since the env var is only set for Production.
function holdingPageActive(): boolean {
  return process.env.HOLDING_PAGE === "true";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (holdingPageActive() && pathname !== "/coming-soon") {
    const response = NextResponse.rewrite(new URL("/coming-soon", req.url));
    response.headers.set("x-robots-tag", "noindex, nofollow");
    return response;
  }

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
