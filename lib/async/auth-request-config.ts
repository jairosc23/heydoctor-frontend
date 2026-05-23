/**
 * Timeouts centralizados para auth (local y Vercel comparten defaults).
 * Override opcional: NEXT_PUBLIC_AUTH_REQUEST_TIMEOUT_MS
 */

const DEFAULT_AUTH_REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_AUTH_OVERLAY_MAX_MS = 20_000;
const DEFAULT_AUTH_HYDRATION_MAX_MS = 25_000;

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const AUTH_REQUEST_TIMEOUT_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_AUTH_REQUEST_TIMEOUT_MS,
  DEFAULT_AUTH_REQUEST_TIMEOUT_MS,
);

/** Watchdog overlay: ligeramente mayor que el timeout de fetch. */
export const AUTH_OVERLAY_MAX_MS = Math.max(
  AUTH_REQUEST_TIMEOUT_MS + 5_000,
  DEFAULT_AUTH_OVERLAY_MAX_MS,
);

/** Hidratación completa (refresh + getMe). */
export const AUTH_HYDRATION_MAX_MS = Math.max(
  AUTH_REQUEST_TIMEOUT_MS + 10_000,
  DEFAULT_AUTH_HYDRATION_MAX_MS,
);
