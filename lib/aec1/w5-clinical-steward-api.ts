/**
 * AEC-1 M1 — thin W5 clinical client for Steward Review Mode.
 * Only list / dismiss / ack. Never confirm / emit / apply-to-chart.
 */

import { w3Fetch, w3RequestHeaders } from "@/lib/w3/w3-http";

export const W5_CLINICAL_AUTHORITY = "NON_AUTHORITY" as const;

export const W5_CLINICAL_DISCLAIMER =
  "Advisory clinical intelligence only. Does not confirm, emit, or modify the clinical record. Dismiss does not change HAB state.";

export type W5ClinicalInsight = {
  insightId?: string;
  id?: string;
  clinicId?: string;
  code?: string;
  title?: string;
  summary?: string;
  status?: string;
  authorityClass?: string;
  disclaimer?: string;
};

export type W5ClinicalListResponse = {
  insights?: W5ClinicalInsight[];
  authorityClass?: string;
  disclaimer?: string;
  code?: string;
  message?: string;
};

function insightIdOf(insight: W5ClinicalInsight): string | null {
  const id = insight.insightId ?? insight.id;
  return typeof id === "string" && id.trim() ? id : null;
}

export async function w5ClinicalListInsights(
  opts: {
    includeDismissed?: boolean;
    fetcher?: typeof fetch;
    baseUrl?: string;
  } = {},
): Promise<W5ClinicalListResponse> {
  const qs = opts.includeDismissed ? "?includeDismissed=true" : "";
  try {
    const res = await w3Fetch(`/api/w5/clinical-intel/insights${qs}`, {
      method: "GET",
      fetcher: opts.fetcher,
      baseUrl: opts.baseUrl ?? "",
      domainPrefix: "W5_CLINICAL",
    });
    return (await res.json()) as W5ClinicalListResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : "W5_CLINICAL_ERROR";
    const denied =
      /403|DENIED|AUTHORITY_FORBIDDEN|FLAG_OFF/i.test(message);
    return {
      insights: [],
      authorityClass: W5_CLINICAL_AUTHORITY,
      disclaimer: W5_CLINICAL_DISCLAIMER,
      code: denied ? "W5_FLAG_OR_AUTHORITY_DENIED" : "W5_CLINICAL_ERROR",
      message,
    };
  }
}

export async function w5ClinicalDismissInsight(
  insightId: string,
  note?: string,
  opts: { fetcher?: typeof fetch; baseUrl?: string } = {},
): Promise<{ ok: boolean; code?: string; body?: unknown }> {
  return mutateInsight("dismiss", insightId, note, opts);
}

export async function w5ClinicalAckInsight(
  insightId: string,
  note?: string,
  opts: { fetcher?: typeof fetch; baseUrl?: string } = {},
): Promise<{ ok: boolean; code?: string; body?: unknown }> {
  return mutateInsight("ack", insightId, note, opts);
}

async function mutateInsight(
  action: "dismiss" | "ack",
  insightId: string,
  note: string | undefined,
  opts: { fetcher?: typeof fetch; baseUrl?: string },
): Promise<{ ok: boolean; code?: string; body?: unknown }> {
  const fetcher = opts.fetcher ?? fetch;
  const baseUrl = opts.baseUrl ?? "";
  const res = await fetcher(
    `${baseUrl}/api/w5/clinical-intel/insights/${encodeURIComponent(insightId)}/${action}`,
    {
      method: "POST",
      credentials: "include",
      headers: w3RequestHeaders("POST"),
      body: JSON.stringify(note ? { note } : {}),
    },
  );
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const code =
      typeof body === "object" &&
      body &&
      "code" in body &&
      typeof (body as { code: unknown }).code === "string"
        ? (body as { code: string }).code
        : `W5_CLINICAL_HTTP_${res.status}`;
    return { ok: false, code, body };
  }
  return { ok: true, body };
}

/** Explicit denylist — Steward UI must never call these. */
export const STEWARD_FORBIDDEN_PATHS = [
  "/api/w5/clinical-intel/confirm",
  "/api/w5/clinical-intel/emit",
  "/api/w5/clinical-intel/apply-to-chart",
  "/api/w5/clinical-intel/bypass-hab",
] as const;

export function resolveInsightId(insight: W5ClinicalInsight): string | null {
  return insightIdOf(insight);
}
