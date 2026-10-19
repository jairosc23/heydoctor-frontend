/**
 * Limpieza global de sesión cuando el refresh falla o la API responde 401 definitivo.
 */

import { authLogout } from "@/lib/auth-client";
import { emitAuthTelemetry } from "@/lib/auth-telemetry";

let redirectInFlight = false;

/**
 * Revoca sesión en API, borra token en memoria y cookie `heydoctor_session`.
 * Opcionalmente redirige a /login (por defecto en cliente).
 */
export async function handleAuthError(
  options: { redirect?: boolean } = {}
): Promise<void> {
  const { redirect = true } = options;

  try {
    await authLogout();
  } catch {
    /* authLogout ya limpia estado local aunque falle el fetch */
  }

  emitAuthTelemetry("unauthorized", { redirect });

  if (redirect && typeof window !== "undefined" && !redirectInFlight) {
    redirectInFlight = true;
    const next = `${window.location.pathname}${window.location.search}`;
    const loginUrl =
      next && next !== "/login"
        ? `/login?redirect=${encodeURIComponent(next)}`
        : "/login";
    window.location.replace(loginUrl);
  }
}
