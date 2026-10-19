/**
 * CB-3 — PHI scrubbing for voluntary UX comments.
 */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;
const CLINICAL_LEAK_RE =
  /\b(paciente|diagn[oó]stico|soap|prescripci[oó]n|cefalea|dolor|anamnesis|expediente)\b/gi;

export function scrubValidationComment(
  input: string | null | undefined,
  maxLength: number,
): string | null {
  if (!input?.trim()) return null;
  let text = input.trim();
  text = text.replace(EMAIL_RE, "[REDACTED]");
  text = text.replace(PHONE_RE, "[REDACTED]");
  text = text.replace(CLINICAL_LEAK_RE, "[REDACTED]");
  if (text.length > maxLength) {
    text = `${text.slice(0, maxLength)}…`;
  }
  return text.length > 0 ? text : null;
}

export function truncateConsultationRef(
  consultationId: string | null | undefined,
): string | null {
  if (!consultationId?.trim()) return null;
  return consultationId.trim().slice(0, 8);
}
