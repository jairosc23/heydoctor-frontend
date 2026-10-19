/**
 * F2-08 — Canonical Medical Copilot sessionId invariant.
 * Trim + non-empty; adapters/hooks must never call APIs with blank ids.
 */

const SESSION_ID_MAX = 128;

export function assertMedicalCopilotSessionId(
  raw: unknown,
): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > SESSION_ID_MAX) return null;
  return trimmed;
}
