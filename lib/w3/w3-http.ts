/**
 * Shared Wave-3 HTTP helpers — consolidate deny mapping + CSRF headers.
 * Public function signatures of domain clients remain unchanged.
 */

import {
  API_CSRF_HEADER,
  API_X_REQUESTED_WITH,
  API_XRW_XMLHTTPREQUEST,
  getApiCsrfToken,
} from "@/lib/api-csrf";

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function w3MapDeny(res: Response, domainPrefix: string): never {
  throw new Error(
    res.status === 403
      ? "W3_FLAG_OR_CONTEXT_DENIED"
      : `${domainPrefix}_HTTP_${res.status}`,
  );
}

/** Headers for W3 requests; mutations include CSRF when token is available. */
export function w3RequestHeaders(
  method: string,
  extra?: HeadersInit,
): Record<string, string> {
  const headers: Record<string, string> = {
    ...(extra
      ? Object.fromEntries(new Headers(extra).entries())
      : {}),
  };
  if (UNSAFE.has(method.toUpperCase())) {
    if (!headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json";
    }
    headers[API_X_REQUESTED_WITH] = API_XRW_XMLHTTPREQUEST;
    const csrf = getApiCsrfToken();
    if (csrf) {
      headers[API_CSRF_HEADER] = csrf;
    }
  }
  return headers;
}

export async function w3Fetch(
  pathWithQuery: string,
  init: {
    method?: string;
    body?: string;
    fetcher?: typeof fetch;
    baseUrl?: string;
    domainPrefix: string;
  },
): Promise<Response> {
  const method = init.method ?? "GET";
  const fetcher = init.fetcher ?? fetch;
  const baseUrl = init.baseUrl ?? "";
  const res = await fetcher(`${baseUrl}${pathWithQuery}`, {
    method,
    credentials: "include",
    headers: w3RequestHeaders(method),
    body: init.body,
  });
  if (!res.ok) w3MapDeny(res, init.domainPrefix);
  return res;
}
