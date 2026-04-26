/**
 * Punto único para observabilidad de auth (hook opcional + debug).
 * No incluir tokens ni secretos en `detail`.
 */

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
  if (process.env.NODE_ENV === "development") {
    console.debug(`[auth-telemetry] ${event}`, detail ?? {});
  }
}
