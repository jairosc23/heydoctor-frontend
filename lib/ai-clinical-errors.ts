import { ApiError } from "./heydoctor-api";

const RATE_LIMIT_COPY =
  "La asistencia clínica se actualizará en unos segundos.";

export function isAiRateLimitError(error: unknown): boolean {
  if (error instanceof ApiError && error.status === 429) return true;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return /throttlerexception|too many requests|429/i.test(message);
}

/** Phase 4.5 — nunca exponer ThrottlerException al médico. */
export function humanizeAiClinicalError(error: unknown): string | null {
  if (isAiRateLimitError(error)) return RATE_LIMIT_COPY;
  if (error instanceof ApiError && error.status >= 500) {
    return "La asistencia clínica no está disponible temporalmente.";
  }
  return null;
}
