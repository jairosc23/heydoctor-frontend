import { w3Fetch } from "@/lib/w3/w3-http";

export async function w3MobileOpenSession(
  deviceId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/mobile/session/open", {
    method: "POST",
    body: JSON.stringify({ deviceId }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_MOBILE",
  });
  return res.json();
}
