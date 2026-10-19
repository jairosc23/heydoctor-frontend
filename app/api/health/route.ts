import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Frontend liveness only. No database, cache, backend, secrets, or PHI.
 */
export function GET(): NextResponse {
  return NextResponse.json(
    { ok: true, status: "alive" },
    {
      status: 200,
      headers: { "cache-control": "no-store" },
    },
  );
}
