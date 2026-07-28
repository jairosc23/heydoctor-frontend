import { w3Fetch } from "@/lib/w3/w3-http";

export async function w3PopListCohorts(
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/pop/cohorts", {
    method: "GET",
    fetcher,
    baseUrl,
    domainPrefix: "W3_POP",
  });
  return res.json();
}

export async function w3PopDefineCohort(
  input: {
    label: string;
    criteria: Array<{
      field: string;
      op: string;
      valueString?: string;
      valueNumber?: number;
      valueBoolean?: boolean;
    }>;
  },
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/pop/cohorts", {
    method: "POST",
    body: JSON.stringify(input),
    fetcher,
    baseUrl,
    domainPrefix: "W3_POP",
  });
  return res.json();
}

export async function w3PopEvaluateCohort(
  cohortId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(`/api/w3/pop/cohorts/${cohortId}/evaluate`, {
    method: "POST",
    fetcher,
    baseUrl,
    domainPrefix: "W3_POP",
  });
  return res.json();
}
