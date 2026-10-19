import { w3Fetch } from "@/lib/w3/w3-http";

export type W3TimelineQuery = {
  consultationId: string;
  sources?: string[];
  groupBy?: "none" | "day" | "source";
  offset?: number;
  limit?: number;
};

/** Read-only Timeline client — no POST/PATCH helpers. */
export async function w3TimelineGet(
  query: W3TimelineQuery,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const params = new URLSearchParams({
    consultationId: query.consultationId,
  });
  if (query.sources?.length) params.set("sources", query.sources.join(","));
  if (query.groupBy) params.set("groupBy", query.groupBy);
  if (query.offset != null) params.set("offset", String(query.offset));
  if (query.limit != null) params.set("limit", String(query.limit));

  const res = await w3Fetch(`/api/w3/timeline?${params}`, {
    method: "GET",
    fetcher,
    baseUrl,
    domainPrefix: "W3_TIMELINE",
  });
  return res.json();
}
