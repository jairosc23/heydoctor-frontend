import { NextRequest, NextResponse } from "next/server";
import {
  extractBearerToken,
  getJwtRemainingSeconds,
  parseJwtPayload,
} from "@/lib/auth/jwt-utils";

const SESSION_COOKIE = "heydoctor_session";
/** Misma tolerancia que el proxy: no rechazar token recién emitido por desfase de reloj. */
const SESSION_CLOCK_SKEW_MS = 5_000;

/**
 * POST: recibe Bearer (JWT ya emitido por el Nest tras login en el cliente); valida forma y `exp` localmente
 * y fija cookie HttpOnly en el origen Next (proxy). **No** llama al backend (sin proxy login/sesión).
 * La firma y autorización siguen validándose en el API en cada petición con `credentials: 'include'`.
 * DELETE: borra cookie.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = extractBearerToken(auth);
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payload = parseJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== "number") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const expMs = exp * 1000;
  if (expMs < Date.now() - SESSION_CLOCK_SKEW_MS) {
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
