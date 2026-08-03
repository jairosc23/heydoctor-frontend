import { ApiError } from "./heydoctor-api";
import { Rc5FeTimeoutError } from "./medical-copilot/rc5-operational/resilience";

const RATE_LIMIT_COPY =
  "La asistencia clínica se actualizará en unos segundos.";

/** Friendly NON_AUTHORITY copy — never expose paths, timeouts, or stack details. */
export const AI_ASSIST_UNAVAILABLE_COPY =
  "La asistencia clínica no está disponible temporalmente. Puede continuar la consulta; esta sugerencia no modifica la ficha.";

const TECHNICAL_LEAK_PATTERNS = [
  /RC5\s*FE\s*timeout/i,
  /timeout\s*\d+\s*ms/i,
  /timed?\s*out/i,
  /ECONNREFUSED/i,
  /AbortError/i,
  /\/api\//i,
  /medical-copilot/i,
  /stack/i,
  /exception/i,
  /Internal Server Error/i,
  /HTTP\s*\d{3}/i,
  /governed_timeout/i,
];

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

function errorMessageOf(error: unknown): string {
  if (error instanceof Error) return error.message ?? "";
  if (typeof error === "string") return error;
  return "";
}

export function isTechnicalAiErrorMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  return TECHNICAL_LEAK_PATTERNS.some((re) => re.test(trimmed));
}

/** Phase 4.5 — nunca exponer ThrottlerException / timeouts técnicos al médico. */
export function humanizeAiClinicalError(error: unknown): string | null {
  if (isAiRateLimitError(error)) return RATE_LIMIT_COPY;
  if (error instanceof Rc5FeTimeoutError) return AI_ASSIST_UNAVAILABLE_COPY;
  if (error instanceof ApiError && error.status >= 500) {
    return AI_ASSIST_UNAVAILABLE_COPY;
  }
  const message = errorMessageOf(error);
  if (message && isTechnicalAiErrorMessage(message)) {
    return AI_ASSIST_UNAVAILABLE_COPY;
  }
  return null;
}

/**
 * Always returns UI-safe copy. Logs technical detail to console for telemetry.
 * Fail-closed: never returns endpoint/timeout internals.
 */
export function toAiClinicalUserMessage(
  error: unknown,
  fallback: string = AI_ASSIST_UNAVAILABLE_COPY,
): string {
  const technical = errorMessageOf(error);
  if (technical) {
    console.warn("[ai-clinical]", technical);
  }
  return humanizeAiClinicalError(error) ??
    (technical && !isTechnicalAiErrorMessage(technical) ? technical : fallback);
}
