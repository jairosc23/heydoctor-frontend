import { ApiError } from "@/lib/heydoctor-api";

const RETRYABLE_STATUS = new Set([408, 500, 502, 503, 504]);

function statusOf(error: unknown): number | null {
  if (error instanceof ApiError) return error.status;
  return null;
}

/**
 * Safe query retry: never retry HAB/auth/client failures.
 * One retry only for transient network / 5xx / 408.
 */
export function shouldRetryFailedQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= 1) return false;
  const status = statusOf(error);
  if (status == null) return true;
  return RETRYABLE_STATUS.has(status);
}
