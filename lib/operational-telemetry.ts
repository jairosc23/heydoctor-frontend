export type OperationalTelemetryEvent =
  | "auth.login"
  | "auth.refresh"
  | "auth.timeout"
  | "appointments.conflict"
  | "webrtc.degraded"
  | "webrtc.reconnect"
  | "webrtc.ice_restart";

export type OperationalTelemetryDetail = {
  outcome?: "success" | "error" | "timeout" | "conflict";
  status?: number;
  operation?: string;
  reason?: string;
  state?: string;
  count?: number;
  requestId?: string | null;
};

declare global {
  interface Window {
    __HEYDOCTOR_OPERATIONAL_TELEMETRY__?: (
      event: OperationalTelemetryEvent,
      detail?: OperationalTelemetryDetail,
    ) => void;
  }
}

function sanitizeDetail(
  detail?: OperationalTelemetryDetail,
): OperationalTelemetryDetail | undefined {
  if (!detail) return undefined;
  const safe: OperationalTelemetryDetail = {};
  if (detail.outcome) safe.outcome = detail.outcome;
  if (typeof detail.status === "number") safe.status = detail.status;
  if (detail.operation) safe.operation = detail.operation.slice(0, 64);
  if (detail.reason) safe.reason = detail.reason.slice(0, 64);
  if (detail.state) safe.state = detail.state.slice(0, 64);
  if (typeof detail.count === "number") safe.count = detail.count;
  if (detail.requestId) safe.requestId = detail.requestId.slice(0, 128);
  return safe;
}

export function emitOperationalTelemetry(
  event: OperationalTelemetryEvent,
  detail?: OperationalTelemetryDetail,
): void {
  if (typeof window === "undefined") return;
  const safe = sanitizeDetail(detail);
  try {
    window.__HEYDOCTOR_OPERATIONAL_TELEMETRY__?.(event, safe);
  } catch {
    /* noop */
  }
  if (process.env.NODE_ENV === "development") {
    console.debug(`[operational-telemetry] ${event}`, safe ?? {});
  }
}
