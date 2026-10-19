import { NextRequest, NextResponse } from "next/server";
import { getServerNestApiBase } from "@/lib/api-base";
import { apiFetch as fetchWithIncludedCredentials } from "@/lib/api-fetch-include";

export const dynamic = "force-dynamic";

/**
 * Proxy BFF: el cliente llama al mismo origen Next para evitar POST a `/api/...`
 * cuando `NEXT_PUBLIC_HEYDOCTOR_API_URL` apunta por error al frontend.
 * Reenvía Authorization, cookies y CSRF al Nest.
 */
export async function POST(req: NextRequest) {
  try {
    const base = getServerNestApiBase().replace(/\/$/, "");
    const body = await req.text();
    const auth = req.headers.get("authorization");
    const csrf = req.headers.get("x-csrf-token");
    const cookie = req.headers.get("cookie");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    };
    if (auth?.trim()) headers.Authorization = auth.trim();
    if (csrf?.trim()) headers["X-CSRF-Token"] = csrf.trim();
    if (cookie?.trim()) headers.Cookie = cookie.trim();

    const upstream = await fetchWithIncludedCredentials(
      `${base}/ai/consultation-assist`,
      {
        method: "POST",
        headers,
        body,
        cache: "no-store",
      },
    );

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ error: "proxy_failed" }, { status: 502 });
  }
}
