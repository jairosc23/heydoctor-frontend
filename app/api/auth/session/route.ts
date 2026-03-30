import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/api-base";

const SESSION_COOKIE = "heydoctor_session";
/** Opaque flag: set only after backend GET /auth/me succeeds with the same Bearer. */
const SESSION_VALUE = "1";

function apiOrigin(): string {
  return API_URL.replace(/\/$/, "");
}

/**
 * POST: validate Bearer against backend /auth/me; set first-party HttpOnly cookie for middleware.
 * DELETE: clear cookie (logout UX on this origin).
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const me = await fetch(`${apiOrigin()}/auth/me`, {
    headers: { Authorization: auth },
  });

  if (!me.ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
    maxAge: 60 * 60 * 24 * 7,
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
