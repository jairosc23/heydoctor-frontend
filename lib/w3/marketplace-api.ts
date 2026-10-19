import { w3Fetch } from "@/lib/w3/w3-http";

export async function w3MarketplaceOpen(
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/marketplace/workspace/open", {
    method: "POST",
    body: "{}",
    fetcher,
    baseUrl,
    domainPrefix: "W3_MARKETPLACE",
  });
  return res.json();
}

export async function w3MarketplaceDiscover(
  params: { specialty?: string; query?: string } = {},
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const qs = new URLSearchParams();
  if (params.specialty) qs.set("specialty", params.specialty);
  if (params.query) qs.set("query", params.query);
  const q = qs.toString();
  const res = await w3Fetch(
    `/api/w3/marketplace/discover${q ? `?${q}` : ""}`,
    {
      method: "GET",
      fetcher,
      baseUrl,
      domainPrefix: "W3_MARKETPLACE",
    },
  );
  return res.json();
}

export async function w3MarketplaceAdmin(
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/marketplace/admin/console", {
    method: "GET",
    fetcher,
    baseUrl,
    domainPrefix: "W3_MARKETPLACE",
  });
  return res.json();
}
