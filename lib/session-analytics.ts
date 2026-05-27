/**
 * Telemetría operativa de sesión (cliente). Pasiva: sin mutar auth ni disparar refresh.
 */

import { emitAuthTelemetry, type AuthTelemetryEvent } from "@/lib/auth-telemetry";
import { getLogger } from "@/lib/logger";

const logMetrics = getLogger("REFRESH");

export type SessionAnalyticsEvent =
  | "ssr_client_auth_mismatch"
  | "bootstrap_timeout"
  | "refresh_storm_detected"
  | "unexpected_logout"
  | "redirect_loop_detected"
  | "bootstrap_completed"
  | "session_sync_completed"
  | "session_desync_detected";

const REFRESH_STORM_WINDOW_MS = 12_000;
const REFRESH_STORM_THRESHOLD = 4;
const REDIRECT_LOOP_WINDOW_MS = 8_000;
const REDIRECT_LOOP_THRESHOLD = 3;

const refreshAttemptTimestamps: number[] = [];
let lastRedirectToLoginAt = 0;
let redirectToLoginCount = 0;

function safeDetail(
  detail?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!detail) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(detail)) {
    if (/token|cookie|password|email|authorization|bearer/i.test(key)) {
      continue;
    }
    if (typeof value === "string" && value.length > 200) {
      out[key] = `${value.slice(0, 200)}…`;
    } else {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Registra evento de analytics y reenvía al hook de telemetría auth. */
export function emitSessionAnalytics(
  event: SessionAnalyticsEvent,
  detail?: Record<string, unknown>,
): void {
  const safe = safeDetail(detail);
  const telemetryEvent = event as AuthTelemetryEvent;
  emitAuthTelemetry(telemetryEvent, safe);
  logMetrics.info("session_analytics", { event, ...safe });
}

/** Llamar al iniciar cada intento de refresh (no ejecuta refresh). */
export function trackRefreshAttempt(meta?: Record<string, unknown>): void {
  const now = Date.now();
  refreshAttemptTimestamps.push(now);
  while (
    refreshAttemptTimestamps.length > 0 &&
    now - refreshAttemptTimestamps[0]! > REFRESH_STORM_WINDOW_MS
  ) {
    refreshAttemptTimestamps.shift();
  }
  if (refreshAttemptTimestamps.length >= REFRESH_STORM_THRESHOLD) {
    emitSessionAnalytics("refresh_storm_detected", {
      count: refreshAttemptTimestamps.length,
      windowMs: REFRESH_STORM_WINDOW_MS,
      ...meta,
    });
    refreshAttemptTimestamps.length = 0;
  }
}

export function trackRefreshSuccess(meta?: Record<string, unknown>): void {
  emitAuthTelemetry("refresh_success", safeDetail(meta));
}

export function trackRefreshAbort(meta?: Record<string, unknown>): void {
  emitAuthTelemetry("refresh_abort", safeDetail(meta));
}

export function trackRedirectToLogin(pathname: string): void {
  const now = Date.now();
  if (now - lastRedirectToLoginAt > REDIRECT_LOOP_WINDOW_MS) {
    redirectToLoginCount = 0;
  }
  lastRedirectToLoginAt = now;
  redirectToLoginCount += 1;
  if (redirectToLoginCount >= REDIRECT_LOOP_THRESHOLD) {
    emitSessionAnalytics("redirect_loop_detected", {
      count: redirectToLoginCount,
      pathname,
      windowMs: REDIRECT_LOOP_WINDOW_MS,
    });
    redirectToLoginCount = 0;
  }
}

export function detectSsrClientAuthMismatch(detail: {
  pathname: string;
  hasAccessTokenInRam: boolean;
  loading: boolean;
  hasUser: boolean;
}): void {
  if (detail.loading || detail.hasUser) return;
  if (detail.hasAccessTokenInRam) {
    emitSessionAnalytics("ssr_client_auth_mismatch", {
      pathname: detail.pathname,
      reason: "token_in_ram_no_user",
    });
    return;
  }
  if (detail.pathname.startsWith("/panel") || detail.pathname === "/dashboard") {
    emitSessionAnalytics("session_desync_detected", {
      pathname: detail.pathname,
      reason: "protected_route_no_user",
    });
  }
}

export function recordBootstrapCompleted(durationMs: number, detail?: Record<string, unknown>): void {
  emitSessionAnalytics("bootstrap_completed", {
    durationMs,
    ...detail,
  });
}

export function recordSessionSyncCompleted(
  durationMs: number,
  detail?: Record<string, unknown>,
): void {
  emitSessionAnalytics("session_sync_completed", {
    durationMs,
    ...detail,
  });
}

let userInitiatedLogout = false;

export function markUserInitiatedLogout(): void {
  userInitiatedLogout = true;
}

export function emitUnexpectedLogoutIfNeeded(detail?: Record<string, unknown>): void {
  if (userInitiatedLogout) {
    userInitiatedLogout = false;
    return;
  }
  emitSessionAnalytics("unexpected_logout", detail);
}
