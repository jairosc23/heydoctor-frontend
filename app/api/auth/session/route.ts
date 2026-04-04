import { NextRequest, NextResponse } from "next/server";
import { getAuthMeUrl } from "@/lib/api-base";
import {
  extractBearerToken,
  getJwtRemainingSeconds,
} from "@/lib/auth/jwt-utils";

const SESSION_COOKIE = "heydoctor_session";
/** Opaque flag: set only after backend GET /auth/me succeeds with the same Bearer. */
const SESSION_VALUE = "1";

/**
 * POST: validate Bearer contra GET /api/auth/me del Nest; set cookie HttpOnly para middleware.
 * maxAge del cookie alineado al `exp` del access_token (mínimo 60s).
 * DELETE: clear cookie (logout UX on this origin).
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
  res.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
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
