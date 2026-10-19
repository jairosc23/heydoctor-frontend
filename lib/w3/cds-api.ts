/**
 * WP-03 CDS API client — BE enforces authority; FE never invents Confirm.
 */
import { w3Fetch } from "@/lib/w3/w3-http";

export async function w3CdsEvaluate(
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/cds/evaluate", {
    method: "POST",
    body: JSON.stringify({ consultationId }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_CDS",
  });
  return res.json();
}

export async function w3CdsDismiss(
  recommendationId: string,
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(
    `/api/w3/cds/recommendations/${recommendationId}/dismiss`,
    {
      method: "POST",
      body: JSON.stringify({ consultationId }),
      fetcher,
      baseUrl,
      domainPrefix: "W3_CDS",
    },
  );
  return res.json();
}

export async function w3CdsApply(
  recommendationId: string,
  body: {
    consultationId: string;
    targetSsot: "documentation" | "care_plan" | "order";
  },
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(
    `/api/w3/cds/recommendations/${recommendationId}/apply`,
    {
      method: "POST",
      body: JSON.stringify(body),
      fetcher,
      baseUrl,
      domainPrefix: "W3_CDS",
    },
  );
  return res.json();
}
