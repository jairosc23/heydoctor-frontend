import { w3Fetch } from "@/lib/w3/w3-http";

export async function w3AnalyticsGetDashboard(
  window: "7d" | "30d" | "90d" = "30d",
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const q = new URLSearchParams({ window });
  const res = await w3Fetch(`/api/w3/analytics/dashboard?${q}`, {
    method: "GET",
    fetcher,
    baseUrl,
    domainPrefix: "W3_ANALYTICS",
  });
  return res.json();
}

export async function w3AnalyticsOpenWorkspace(
  window: "7d" | "30d" | "90d" = "30d",
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/analytics/workspace/open", {
    method: "POST",
    body: JSON.stringify({ window }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_ANALYTICS",
  });
  return res.json();
}
