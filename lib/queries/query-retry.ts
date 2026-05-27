import { ApiError } from "@/lib/heydoctor-api";

/** No reintentar rate-limit ni sesión; un solo retry para otros errores transitorios. */
export function shouldRetryFailedQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= 1) return false;
  if (error instanceof ApiError) {
    if (error.status === 429 || error.status === 401) return false;
  }
  return true;
}
