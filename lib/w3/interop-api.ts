import { w3Fetch } from "@/lib/w3/w3-http";

export async function w3InteropOpen(
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/interop/workspace/open", {
    method: "POST",
    body: "{}",
    fetcher,
    baseUrl,
    domainPrefix: "W3_INTEROP",
  });
  return res.json();
}
