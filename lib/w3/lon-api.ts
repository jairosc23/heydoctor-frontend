import { w3Fetch } from "@/lib/w3/w3-http";

export async function w3LonPublish(
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/lon/publish", {
    method: "POST",
    body: JSON.stringify({ consultationId }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_LON",
  });
  return res.json();
}

export async function w3LonGetInsights(
  consultationId: string,
  includeDismissed = false,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const q = new URLSearchParams({
    consultationId,
    ...(includeDismissed ? { includeDismissed: "true" } : {}),
  });
  const res = await w3Fetch(`/api/w3/lon/insights?${q}`, {
    method: "GET",
    fetcher,
    baseUrl,
    domainPrefix: "W3_LON",
  });
  return res.json();
}

export async function w3LonDismiss(
  insightId: string,
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(`/api/w3/lon/insights/${insightId}/dismiss`, {
    method: "POST",
    body: JSON.stringify({ consultationId }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_LON",
  });
  return res.json();
}

export async function w3LonProposeEnrichment(
  consultationId: string,
  summary: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/lon/enrichment/propose", {
    method: "POST",
    body: JSON.stringify({ consultationId, summary }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_LON",
  });
  return res.json();
}
