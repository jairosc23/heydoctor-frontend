import { envTruthy } from "./env-truthy";
import { getApiBase } from "./api-base";

/** Flag de auth web sobre /hd-api. Default OFF. No encender NEXT_PUBLIC_HD_API_EDGE. */
export const HD_API_AUTH_FLAG = "NEXT_PUBLIC_HD_API_AUTH" as const;

export function isHdApiAuthEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_HD_API_AUTH,
): boolean {
  return envTruthy(raw);
}

/** Base HTTP solo para csrf/login/refresh/logout/me. */
export function getAuthEdgeBase(): string {
  if (isHdApiAuthEnabled()) {
    return "/hd-api";
  }
  return getApiBase();
}

export function getAuthEdgeUrl(path: string): string {
  const base = getAuthEdgeBase().replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/**
 * URL que `heydoctorApi` no vuelve a prefijar.
 * Relativo `/hd-api` se expande al origin del documento.
 */
export function getAuthEdgeFetchUrl(path: string): string {
  const url = getAuthEdgeUrl(path);
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${url}`;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (site) {
    return `${site}${url}`;
  }
  return url;
}
