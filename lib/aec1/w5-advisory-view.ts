/**
 * AEC-1 M5 — pure view helpers for W5 deterministic advisory cards.
 * Presentation only. Never invents backend fields or HAB semantics.
 */

import {
  W5_CLINICAL_AUTHORITY,
  resolveInsightId,
  type W5ClinicalInsight,
  type W5ClinicalListResponse,
} from "./w5-clinical-steward-api";

export type W5AdvisoryUiState =
  | "loading"
  | "empty"
  | "advisory"
  | "forbidden"
  | "error";

export function resolveW5AdvisoryUiState(input: {
  loading: boolean;
  response: W5ClinicalListResponse | null;
}): W5AdvisoryUiState {
  if (input.loading) return "loading";
  const code = input.response?.code ?? null;
  if (code === "W5_FLAG_OR_AUTHORITY_DENIED") return "forbidden";
  if (code && code !== "W5_CLINICAL_ERROR" && /DENIED|FORBIDDEN|FLAG_OFF/i.test(code)) {
    return "forbidden";
  }
  if (code === "W5_CLINICAL_ERROR" || (code && /ERROR|HTTP_/i.test(code))) {
    return "error";
  }
  const insights = input.response?.insights ?? [];
  return insights.length > 0 ? "advisory" : "empty";
}

function priorityRank(insight: W5ClinicalInsight): number {
  const raw = insight.priority ?? insight.score ?? insight.severity;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
    const key = raw.toLowerCase();
    if (key === "critical" || key === "high") return 90;
    if (key === "medium" || key === "moderate") return 50;
    if (key === "low") return 10;
  }
  return 0;
}

/** Higher priority/score first; stable by id. */
export function sortW5InsightsForAssist(
  insights: W5ClinicalInsight[],
): W5ClinicalInsight[] {
  return [...insights].sort((a, b) => {
    const diff = priorityRank(b) - priorityRank(a);
    if (diff !== 0) return diff;
    const idA = resolveInsightId(a) ?? "";
    const idB = resolveInsightId(b) ?? "";
    return idA.localeCompare(idB);
  });
}

export function formatW5PriorityLabel(
  insight: W5ClinicalInsight,
): string | null {
  if (insight.priority != null && String(insight.priority).trim()) {
    return String(insight.priority);
  }
  if (insight.score != null && String(insight.score).trim()) {
    return String(insight.score);
  }
  if (insight.severity?.trim()) return insight.severity.trim();
  return null;
}

export function formatW5Explainability(
  insight: W5ClinicalInsight,
): string | null {
  if (typeof insight.explanation === "string" && insight.explanation.trim()) {
    return insight.explanation.trim();
  }
  const exp = insight.explainability;
  if (typeof exp === "string" && exp.trim()) return exp.trim();
  if (exp && typeof exp === "object") {
    const parts = [
      exp.summary?.trim(),
      exp.detail?.trim(),
      Array.isArray(exp.reasons)
        ? exp.reasons.map((r) => r.trim()).filter(Boolean).join("; ")
        : "",
    ].filter(Boolean);
    return parts.length ? parts.join(" — ") : null;
  }
  return null;
}

export function formatW5Provenance(insight: W5ClinicalInsight): string | null {
  if (typeof insight.source === "string" && insight.source.trim()) {
    return insight.source.trim();
  }
  if (typeof insight.sourceClass === "string" && insight.sourceClass.trim()) {
    return insight.sourceClass.trim();
  }
  const p = insight.provenance;
  if (typeof p === "string" && p.trim()) return p.trim();
  if (p && typeof p === "object") {
    const parts = [p.source, p.ruleId, p.origin]
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  }
  return null;
}

export function insightAuthorityClass(insight: W5ClinicalInsight): string {
  return insight.authorityClass?.trim() || W5_CLINICAL_AUTHORITY;
}

export function isInsightLocallySettled(insight: W5ClinicalInsight): {
  acknowledged: boolean;
  dismissed: boolean;
} {
  const status = (insight.status ?? "").toLowerCase();
  return {
    acknowledged:
      Boolean(insight.acknowledgedAt) ||
      status === "acknowledged" ||
      status === "acked",
    dismissed:
      Boolean(insight.dismissedAt) ||
      status === "dismissed",
  };
}
