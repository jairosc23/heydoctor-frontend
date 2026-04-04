import { NextRequest, NextResponse } from "next/server";
import { getAuthMeUrl } from "@/lib/api-base";
import {
  extractBearerToken,
  getJwtRemainingSeconds,
} from "@/lib/auth/jwt-utils";

const SESSION_COOKIE = "heydoctor_session";

/**
 * POST: valida Bearer contra GET /api/auth/me del Nest; set cookie HttpOnly.
 * Valor = access JWT (solo exp legible en middleware Edge; firma sigue validándose en API).
 * maxAge alineado al `exp` del token (mín. 60s).
 * DELETE: borra cookie.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = extractBearerToken(auth);
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const meUrl = getAuthMeUrl();
  const me = await fetch(meUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!me.ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const maxAge = getJwtRemainingSeconds(token);

  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
    maxAge,
  });
  return res;
}

export async function DELETE() {
  const secure = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
    maxAge: 0,
  });
  return res;
}
