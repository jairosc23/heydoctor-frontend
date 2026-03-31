import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/api-base";
import {
  extractBearerToken,
  getJwtRemainingSeconds,
} from "@/lib/auth/jwt-utils";

const SESSION_COOKIE = "heydoctor_session";
/** Opaque flag: set only after backend GET /auth/me succeeds with the same Bearer. */
const SESSION_VALUE = "1";

function apiOrigin(): string {
  return API_URL.replace(/\/$/, "");
}

/**
 * POST: validate Bearer against backend /auth/me; set first-party HttpOnly cookie for middleware.
 * maxAge del cookie alineado al `exp` del access_token (mínimo 60s).
 * DELETE: clear cookie (logout UX on this origin).
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = extractBearerToken(auth);
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const me = await fetch(`${apiOrigin()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
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
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return res;
}
