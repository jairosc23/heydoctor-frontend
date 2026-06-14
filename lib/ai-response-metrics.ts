export type AiMetricKind =
  | "consultation_summary"
  | "consultation_assist"
  | "enriched_documentation"
  | "consultation_insights"
  | "autofill_record";

export type AiMetricEvent = {
  at: number;
  /** Phase 4.8.3A — trazabilidad por solicitud vía ClinicalAiFacade™ */
  requestId?: string;
  kind: AiMetricKind;
  durationMs: number;
  status: "success" | "error" | "empty" | "rate_limited";
  responseLength: number;
  errorCode?: number;
};

const MAX_EVENTS = 40;
const events: AiMetricEvent[] = [];

function pushEvent(event: AiMetricEvent): void {
  events.push(event);
  if (events.length > MAX_EVENTS) events.shift();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(
        "heydoctor:ai-metrics",
        JSON.stringify(events.slice(-20)),
      );
    } catch {
      /* quota */
    }
  }
}

export function recordAiResponseMetric(event: Omit<AiMetricEvent, "at">): void {
  pushEvent({ ...event, at: Date.now() });
}

export function getAiResponseMetrics(): AiMetricEvent[] {
  return [...events];
}

export function summarizeAiResponseMetrics(): {
  total: number;
  errors: number;
  rateLimited: number;
  empty: number;
  avgDurationMs: number;
  avgResponseLength: number;
} {
  const total = events.length;
  if (total === 0) {
    return {
      total: 0,
      errors: 0,
      rateLimited: 0,
      empty: 0,
      avgDurationMs: 0,
      avgResponseLength: 0,
    };
  }
  const errors = events.filter((e) => e.status === "error").length;
  const rateLimited = events.filter((e) => e.status === "rate_limited").length;
  const empty = events.filter((e) => e.status === "empty").length;
  const avgDurationMs = Math.round(
    events.reduce((n, e) => n + e.durationMs, 0) / total,
  );
  const avgResponseLength = Math.round(
    events.reduce((n, e) => n + e.responseLength, 0) / total,
  );
  return {
    total,
    errors,
    rateLimited,
    empty,
    avgDurationMs,
    avgResponseLength,
  };
}
