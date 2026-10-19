const APEX_HOST = "heydoctor.health";
const CANONICAL_ORIGIN = "https://www.heydoctor.health";

/**
 * 307 from the apex host to www, preserving path and query.
 * Any other hostname, including app, staging, localhost and Railway, stays put.
 */
export function canonicalHostRedirectTarget(
  hostname: string,
  pathname: string,
  search = "",
): string | null {
  const host = hostname
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
  if (host !== APEX_HOST) {
    return null;
  }

  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  return `${CANONICAL_ORIGIN}${path}${query}`;
}
