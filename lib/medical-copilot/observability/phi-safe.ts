/**
 * CB-2 — PHI-safe helpers for Clinical Observability.
 * Never include dictation text, transcripts, patient data, or clinical content.
 */

import { sanitizeTelemetryValue } from "@/lib/telemetry-sanitizer";
import {
  CLINICAL_OBSERVABILITY_VERSION,
  type ClinicalTelemetryDetail,
} from "./types";

const BLOCKED_KEY_RE =
  /patient|dictat|transcript|prompt|diagnos|prescri|soap|note|clinical.?content|draft|buffer|text|summary|finding|response|email|name|phone|token|cookie|password/i;

export function truncateRef(id: string | null | undefined, len = 8): string | undefined {
  if (!id?.trim()) return undefined;
  return id.trim().slice(0, len);
}

export function buildSafeDetail(
  partial: Omit<ClinicalTelemetryDetail, "observabilityVersion">,
): ClinicalTelemetryDetail {
  const raw: ClinicalTelemetryDetail = {
    observabilityVersion: CLINICAL_OBSERVABILITY_VERSION,
    ...partial,
  };

  const out: ClinicalTelemetryDetail = {
    observabilityVersion: CLINICAL_OBSERVABILITY_VERSION,
  };

  for (const [key, value] of Object.entries(raw)) {
    if (key === "observabilityVersion") continue;
    if (BLOCKED_KEY_RE.test(key)) continue;
    if (value === undefined) continue;
    if (typeof value === "string" && value.length > 120) {
      (out as Record<string, unknown>)[key] = `${value.slice(0, 120)}…`;
      continue;
    }
    (out as Record<string, unknown>)[key] = value;
  }

  return sanitizeTelemetryValue(out) as ClinicalTelemetryDetail;
}

/** Assert payload has no obvious PHI-shaped values (for tests). */
export function assertPhiSafeDetail(detail: Record<string, unknown>): boolean {
  for (const [key, value] of Object.entries(detail)) {
    if (BLOCKED_KEY_RE.test(key) && key !== "dictationActive") return false;
    if (typeof value === "string" && value.length > 200) return false;
    if (
      typeof value === "string" &&
      /\b(paciente|cefalea|dolor|diagnosis|soap)\b/i.test(value)
    ) {
      return false;
    }
  }
  return true;
}
