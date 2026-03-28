/**
 * Session user helpers (localStorage para datos de perfil no sensibles).
 *
 * IMPORTANTE: El token de acceso ya NO se almacena en localStorage.
 * Se gestiona exclusivamente en memoria via lib/auth-client.ts.
 * El refresh token es una HttpOnly cookie gestionada por el backend.
 */

import { authLogout, getAccessToken } from "./auth-client";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  clinicId?: string;
  clinicName?: string;
  plan?: "free" | "pro";
};

export function saveSession(user: SessionUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("logged", "yes");
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function updateSessionUser(partial: Partial<SessionUser>): void {
  const current = getSessionUser();
  if (!current) return;
  const updated = { ...current, ...partial };
  localStorage.setItem("user", JSON.stringify(updated));
}

export function clearLocalSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
  localStorage.removeItem("logged");
  localStorage.removeItem("token");
}

/** Limpia sesión completa y redirige a login. */
export async function logoutAndRedirectToLogin(): Promise<void> {
  await authLogout();
  clearLocalSession();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// ── Backward-compatibility shims ────────────────────────────────
// Estos exports se mantienen para que archivos que aún los importan
// no rompan en compilación. Delegan al nuevo sistema.

/** @deprecated Use getAccessToken() from lib/auth-client.ts */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return getAccessToken();
}

/** @deprecated Token is no longer stored in localStorage. */
export function saveToken(_accessToken: string): void {
  // No-op: tokens are now in-memory only via auth-client.ts
}

/** @deprecated Use authLogout() from lib/auth-client.ts */
export function removeToken(): void {
  clearLocalSession();
}
