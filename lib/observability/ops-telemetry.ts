/**
 * PQ-05 / PQ-10 — Thin operational telemetry facade (frontend).
 * Listens to existing hooks; does not instrument clinical/agenda/copilot product code.
 * Event catalog: ops-event-taxonomy.ts · Architecture: BE ops-observability-architecture.ts
 */

import { sanitizeTelemetryValue } from "@/lib/telemetry-sanitizer";
import {
  getLastServerRequestId,
  getOrCreateClientCorrelationId,
} from "@/lib/observability/correlation";
import { captureOpsEvent } from "@/lib/observability/ops-sentry";

export type OpsDomain =
  | "auth"
  | "navigation"
  | "render"
  | "clinical_log"
  | "platform";

export type OpsTelemetryDetail = Record<string, unknown>;

declare global {
  interface Window {
    __HEYDOCTOR_OBSERVE__?: (
      level: "debug" | "info" | "warn" | "error",
      channel: string,
      message: string,
      extras?: Record<string, unknown>,
    ) => void;
    __HEYDOCTOR_OPS_TELEMETRY__?: (
      domain: OpsDomain,
      event: string,
      detail?: OpsTelemetryDetail,
    ) => void;
  }
}

const PATH_UUID =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Redact IDs from paths for low-cardinality navigation metrics. */
export function classifyRoutePath(pathname: string): string {
  return pathname
    .replace(PATH_UUID, ":id")
    .replace(/\/\d+(?=\/|$)/g, "/:n")
    .slice(0, 160);
}

export function emitOpsEvent(
  domain: OpsDomain,
  event: string,
  detail: OpsTelemetryDetail = {},
): void {
  if (typeof window === "undefined") return;

  const safeDetail = sanitizeTelemetryValue({
    ...detail,
    clientCorrelationId: getOrCreateClientCorrelationId(),
    lastServerRequestId: getLastServerRequestId(),
  }) as OpsTelemetryDetail;

  try {
    window.__HEYDOCTOR_OPS_TELEMETRY__?.(domain, event, safeDetail);
  } catch {
    /* noop */
  }

  captureOpsEvent(domain, event, safeDetail);

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug(`[ops-telemetry] ${domain}.${event}`, safeDetail);
  }
}
