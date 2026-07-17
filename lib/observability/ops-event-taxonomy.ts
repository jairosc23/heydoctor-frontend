/**
 * PQ-10 — Frontend ops event taxonomy (pairs with BE ops-observability-architecture).
 * Emit via emitOpsEvent only for platform ops; do not create a parallel sink.
 */

export const OPS_CORRELATION_HEADERS = {
  requestId: "X-Request-Id",
  clientCorrelationId: "X-Client-Correlation-Id",
} as const;

export type OpsEventDomain =
  | "auth"
  | "navigation"
  | "render"
  | "clinical_log"
  | "platform";

export type OpsFeEventDefinition = {
  domain: OpsEventDomain;
  event: string;
  purpose: string;
  /** Optional BE metric name for correlation dashboards. */
  correlatesWith?: string;
};

export const OPS_FE_EVENT_TAXONOMY: readonly OpsFeEventDefinition[] = [
  {
    domain: "auth",
    event: "login_fail",
    purpose: "Failed client login",
    correlatesWith: "auth.login.failure",
  },
  {
    domain: "auth",
    event: "refresh_fail",
    purpose: "Refresh token failure",
    correlatesWith: "auth.refresh.failure",
  },
  {
    domain: "auth",
    event: "refresh_storm_detected",
    purpose: "Client-side refresh storm",
    correlatesWith: "auth.refresh.failure",
  },
  {
    domain: "navigation",
    event: "route_view",
    purpose: "Low-cardinality route shape",
  },
  {
    domain: "render",
    event: "error_boundary",
    purpose: "UI crash boundary (when wired)",
  },
  {
    domain: "clinical_log",
    event: "log_warn",
    purpose: "Clinical logger warn → ops",
  },
  {
    domain: "clinical_log",
    event: "log_error",
    purpose: "Clinical logger error → ops",
  },
  {
    domain: "platform",
    event: "bootstrap",
    purpose: "Ops bootstrap lifecycle",
  },
] as const;

/** Event names: snake_case. */
export const OPS_FE_EVENT_PATTERN = /^[a-z][a-z0-9_]{2,64}$/;

export function isValidOpsFeEventName(event: string): boolean {
  return OPS_FE_EVENT_PATTERN.test(event);
}

export function feEventKey(domain: string, event: string): string {
  return `ops.${domain}.${event}`;
}
