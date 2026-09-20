import { NextResponse } from "next/server";
import data from "@/data/data.json";

export const dynamic = "force-static";

// Public read-only JSON feed of the full festival + hotel dataset — lets
// agents and third parties consume structured data directly instead of
// scraping HTML.
export function GET() {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
