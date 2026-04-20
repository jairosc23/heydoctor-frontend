import { NextResponse } from "next/server";
import { getApiBase } from "@/lib/api-base";

/** ISR: respuesta revalidada como máximo cada 60s; reduce carga al Nest. */
export const revalidate = 60;

export async function GET() {
  try {
    const base = getApiBase().replace(/\/$/, "");
    const upstream = await fetch(`${base}/payments/consultation-price`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "upstream_error", status: upstream.status },
        { status: 502 },
      );
    }
    const body: unknown = await upstream.json();
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
