import { w3Fetch } from "@/lib/w3/w3-http";

export async function w3CpiEvaluate(
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/cpi/evaluate", {
    method: "POST",
    body: JSON.stringify({ consultationId }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_CPI",
  });
  return res.json();
}

export async function w3CpiDismiss(
  suggestionId: string,
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(
    `/api/w3/cpi/suggestions/${suggestionId}/dismiss`,
    {
      method: "POST",
      body: JSON.stringify({ consultationId }),
      fetcher,
      baseUrl,
      domainPrefix: "W3_CPI",
    },
  );
  return res.json();
}

export async function w3CpiApply(
  suggestionId: string,
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(
    `/api/w3/cpi/suggestions/${suggestionId}/apply`,
    {
      method: "POST",
      body: JSON.stringify({ consultationId }),
      fetcher,
      baseUrl,
      domainPrefix: "W3_CPI",
    },
  );
  return res.json();
}
