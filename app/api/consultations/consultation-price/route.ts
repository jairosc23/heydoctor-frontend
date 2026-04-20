import { NextResponse } from "next/server";
import { getApiBase } from "@/lib/api-base";

/** El Nest exige JWT; el Bearer se reenvía desde el cliente. Sin caché CDN por usuario. */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const base = getApiBase().replace(/\/$/, "");
    const incomingAuth = request.headers.get("authorization");
    const headers: Record<string, string> = { Accept: "application/json" };
    if (incomingAuth?.trim()) {
      headers.Authorization = incomingAuth.trim();
    }

    const upstream = await fetch(`${base}/consultations/consultation-price`, {
      headers,
      cache: "no-store",
    });

    const text = await upstream.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text };
    }

    if (!upstream.ok) {
      return NextResponse.json(
        body ?? { error: "upstream_error", status: upstream.status },
        { status: upstream.status },
      );
    }

    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
