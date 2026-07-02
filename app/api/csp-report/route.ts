import { NextResponse } from "next/server";
import { sanitizeCspReportPayload } from "@/lib/csp-report";

export const runtime = "edge";

function acceptsCspReportContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase();
  return (
    normalized.includes("application/csp-report") ||
    normalized.includes("application/json") ||
    normalized.includes("application/reports+json")
  );
}

/**
 * Receptor de violaciones CSP (report-uri / Reporting API).
 * Sin PHI: solo directiva y URIs sin query.
 * No persiste en DB; log estructurado para agregadores (Vercel/Railway logs).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!acceptsCspReportContentType(contentType)) {
    return new NextResponse(null, { status: 415 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const sanitized = sanitizeCspReportPayload(body);
    if (sanitized) {
      console.warn("csp_violation_report", sanitized);
    }
  } catch {
    /* Nunca propagar errores de sanitización al cliente. */
  }

  return new NextResponse(null, { status: 204 });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    accepts: "POST application/csp-report | application/json | application/reports+json",
  });
}
