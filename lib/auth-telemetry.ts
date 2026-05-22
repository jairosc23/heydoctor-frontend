/**
 * Punto único para observabilidad de auth (hook opcional + debug).
 * No incluir tokens ni secretos en `detail`.
 */

import { emitOperationalTelemetry } from "./operational-telemetry";

export type AuthTelemetryEvent =
  | "login_success"
  | "login_fail"
  | "refresh_fail"
  | "unauthorized";

declare global {
  interface Window {
    __HEYDOCTOR_AUTH_TELEMETRY__?: (
      event: AuthTelemetryEvent,
      detail?: Record<string, unknown>,
    ) => void;
  }
}

export function emitAuthTelemetry(
  event: AuthTelemetryEvent,
  detail?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.__HEYDOCTOR_AUTH_TELEMETRY__?.(event, detail);
  } catch {
    /* noop */
  }
  if (event === "login_success") {
    emitOperationalTelemetry("auth.login", { outcome: "success" });
  }
  if (event === "login_fail") {
    emitOperationalTelemetry("auth.login", {
      outcome: "error",
      status: typeof detail?.status === "number" ? detail.status : undefined,
      reason: typeof detail?.reason === "string" ? detail.reason : undefined,
    });
  }
  if (event === "refresh_fail") {
    emitOperationalTelemetry("auth.refresh", {
      outcome: "error",
      status: typeof detail?.status === "number" ? detail.status : undefined,
    });
  }
  if (process.env.NODE_ENV === "development") {
    console.debug(`[auth-telemetry] ${event}`, detail ?? {});
  }
}
