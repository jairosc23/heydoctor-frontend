/**
 * PQ-05 — Sentry sink for platform ops events (mirrors sentry-webrtc pattern).
 */
import * as Sentry from "@sentry/nextjs";

type OpsDomain =
  | "auth"
  | "navigation"
  | "render"
  | "clinical_log"
  | "platform";

const HIGH_SIGNAL_AUTH = new Set([
  "refresh_fail",
  "refresh_timeout",
  "refresh_storm_detected",
  "unauthorized",
  "redirect_loop_detected",
  "unexpected_logout",
  "login_fail",
]);

export function captureOpsEvent(
  domain: OpsDomain,
  event: string,
  detail: Record<string, unknown>,
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) return;

  const level: Sentry.SeverityLevel =
    domain === "render" ||
    event.includes("fail") ||
    event.includes("error") ||
    HIGH_SIGNAL_AUTH.has(event)
      ? "warning"
      : "info";

  Sentry.addBreadcrumb({
    category: `ops.${domain}`,
    message: event,
    level,
    data: detail,
  });

  if (level === "warning") {
    Sentry.withScope((scope) => {
      scope.setTag("ops_domain", domain);
      scope.setTag("ops_event", event.slice(0, 64));
      if (typeof detail.clientCorrelationId === "string") {
        scope.setTag(
          "clientCorrelationId",
          detail.clientCorrelationId.slice(0, 32),
        );
      }
      if (typeof detail.lastServerRequestId === "string") {
        scope.setTag(
          "requestId",
          detail.lastServerRequestId.slice(0, 32),
        );
      }
      Sentry.captureMessage(`ops.${domain}.${event}`, level);
    });
  }
}
