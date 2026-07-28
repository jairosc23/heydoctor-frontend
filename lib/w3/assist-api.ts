/**
 * WP-02 Assist API client — mutations require BE success; no client authority.
 */
import { w3Fetch } from "@/lib/w3/w3-http";

export type W3AssistEvaluateResponse = {
  proposalSetId: string;
  state: string;
  proposals: Array<{
    proposalId: string;
    kind: string;
    payload: Record<string, unknown>;
    groundingRefs: unknown[];
    status: string;
  }>;
  isAuthority: false;
  mayConfirm: false;
  mayEmit: false;
  mayReady: false;
};

export async function w3AssistEvaluate(
  consultationId: string,
  options?: { grounding?: boolean },
  fetcher: typeof fetch = fetch,
  baseUrl = "",
): Promise<W3AssistEvaluateResponse> {
  const res = await w3Fetch("/api/w3/assist/evaluate", {
    method: "POST",
    body: JSON.stringify({ consultationId, options }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_ASSIST",
  });
  return res.json() as Promise<W3AssistEvaluateResponse>;
}

export async function w3AssistDispose(
  proposalId: string,
  body: {
    consultationId: string;
    disposition: "accept" | "reject" | "refine" | "ignore";
    note?: string;
  },
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(`/api/w3/assist/proposals/${proposalId}/dispose`, {
    method: "POST",
    body: JSON.stringify(body),
    fetcher,
    baseUrl,
    domainPrefix: "W3_ASSIST",
  });
  return res.json();
}

export async function w3AssistDismiss(
  proposalId: string,
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(`/api/w3/assist/proposals/${proposalId}/dismiss`, {
    method: "POST",
    body: JSON.stringify({ consultationId }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_ASSIST",
  });
  return res.json();
}

export async function w3AssistApply(
  proposalId: string,
  body: {
    consultationId: string;
    targetSsot: "documentation" | "care_plan" | "order";
  },
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(`/api/w3/assist/proposals/${proposalId}/apply`, {
    method: "POST",
    body: JSON.stringify(body),
    fetcher,
    baseUrl,
    domainPrefix: "W3_ASSIST",
  });
  return res.json();
}
