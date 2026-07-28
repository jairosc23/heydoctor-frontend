/**
 * WP-01 — capabilities client. Read-only; does not authorize.
 */
import type { W3WorkspaceCapabilities } from "@/lib/w3/types";
import { w3MapDeny } from "@/lib/w3/w3-http";

export async function fetchW3WorkspaceCapabilities(
  fetcher: typeof fetch = fetch,
  baseUrl = "",
): Promise<W3WorkspaceCapabilities> {
  const res = await fetcher(`${baseUrl}/api/w3/workspace/capabilities`, {
    credentials: "include",
  });
  if (!res.ok) {
    w3MapDeny(res, "W3_CAPABILITIES");
  }
  const body = (await res.json()) as { data: W3WorkspaceCapabilities };
  return body.data;
}
