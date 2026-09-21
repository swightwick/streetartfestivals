import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Health endpoint for the public festivals API — referenced as the "status"
// link relation from /.well-known/api-catalog (RFC 9727).
export function GET() {
  return NextResponse.json(
    { status: "ok", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
