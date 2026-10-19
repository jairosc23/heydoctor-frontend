/**
 * F2-06 — Typed client for GET /api/audit/export (admin).
 * Does not alter immutable audit rows; reads CSV + pagination headers.
 */
import { getApiBase } from "@/lib/api-base";
import { apiFetch as fetchWithCredentials } from "@/lib/api-fetch-include";
import {
  getApiCsrfToken,
  API_CSRF_HEADER,
  API_X_REQUESTED_WITH,
  API_XRW_XMLHTTPREQUEST,
} from "@/lib/api-csrf";
import {
  createHttpRequestId,
  getOrCreateClientCorrelationId,
  OPS_CORRELATION_HEADERS,
} from "@/lib/observability/correlation";

export type AuditExportQuery = {
  action?: string;
  resource?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
};

export type AuditExportResult = {
  csv: string;
  page: number;
  limit: number;
  total: number;
  truncated: boolean;
  rowCount: number;
  filename: string | null;
};

function buildQuery(params: AuditExportQuery): string {
  const qs = new URLSearchParams();
  if (params.action) qs.set("action", params.action);
  if (params.resource) qs.set("resource", params.resource);
  if (params.fromDate) qs.set("fromDate", params.fromDate);
  if (params.toDate) qs.set("toDate", params.toDate);
  if (params.page != null) qs.set("page", String(params.page));
  if (params.limit != null) qs.set("limit", String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export async function downloadAuditExport(
  params: AuditExportQuery = {},
): Promise<AuditExportResult> {
  const base = getApiBase().replace(/\/$/, "");
  const url = `${base}/audit/export${buildQuery(params)}`;
  const headers = new Headers({
    Accept: "text/csv,application/json",
    [OPS_CORRELATION_HEADERS.requestId]: createHttpRequestId(),
    [OPS_CORRELATION_HEADERS.clientCorrelationId]:
      getOrCreateClientCorrelationId(),
    [API_X_REQUESTED_WITH]: API_XRW_XMLHTTPREQUEST,
  });
  const csrf = getApiCsrfToken();
  if (csrf) headers.set(API_CSRF_HEADER, csrf);

  const res = await fetchWithCredentials(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`audit export failed: HTTP ${res.status}`);
  }
  const csv = await res.text();
  const disposition = res.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i);
  return {
    csv,
    page: Number(res.headers.get("X-Audit-Export-Page") ?? "1"),
    limit: Number(res.headers.get("X-Audit-Export-Limit") ?? "0"),
    total: Number(res.headers.get("X-Audit-Export-Total") ?? "0"),
    truncated: res.headers.get("X-Audit-Export-Truncated") === "1",
    rowCount: Number(res.headers.get("X-Audit-Export-Row-Count") ?? "0"),
    filename: filenameMatch?.[1] ?? null,
  };
}
