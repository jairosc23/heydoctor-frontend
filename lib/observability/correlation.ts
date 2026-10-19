/**
 * PQ-10 — Correlation ID strategy (extends PQ-05 helpers).
 *
 * Roles (do not conflate):
 * - clientCorrelationId: stable per browser tab/session
 * - requestId (HTTP): unique per API call (X-Request-Id)
 * - callTraceId: WebRTC / call span
 */

import { OPS_CORRELATION_HEADERS } from "@/lib/observability/ops-event-taxonomy";

const SESSION_CORRELATION_KEY = "hd_client_correlation_id";
const LAST_SERVER_REQUEST_ID_KEY = "hd_last_server_request_id";
const CALL_TRACE_KEY = "hd_call_trace_id";

export { OPS_CORRELATION_HEADERS };

function safeRandomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `hd-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** ID de sesión del navegador (no PHI). */
export function getOrCreateClientCorrelationId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_CORRELATION_KEY);
  if (!id) {
    id = safeRandomId();
    sessionStorage.setItem(SESSION_CORRELATION_KEY, id);
  }
  return id;
}

/** Per-request id for X-Request-Id (PQ-10: not the session id). */
export function createHttpRequestId(): string {
  return safeRandomId();
}

export function rememberServerRequestId(response: Response): void {
  if (typeof window === "undefined") return;
  const id = response.headers
    .get(OPS_CORRELATION_HEADERS.requestId)
    ?.trim();
  if (id) {
    sessionStorage.setItem(LAST_SERVER_REQUEST_ID_KEY, id);
  }
}

export function getLastServerRequestId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(LAST_SERVER_REQUEST_ID_KEY);
}

export function setActiveCallTraceId(traceId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CALL_TRACE_KEY, traceId);
}

export function getActiveCallTraceId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CALL_TRACE_KEY);
}

export function clearActiveCallTraceId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CALL_TRACE_KEY);
}

export function createCallTraceId(): string {
  return safeRandomId();
}
