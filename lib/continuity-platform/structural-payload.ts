import type {
  ContinuityStructuralMedication,
  ContinuityStructuralPayload,
} from "./types";

const FORBIDDEN_PAYLOAD_KEYS = new Set([
  "cie10CodeId",
  "cie10Hints",
  "safetyDecision",
  "evaluated",
  "patientId",
  "consultationId",
  "prescriptionId",
  "assistanceProvenance",
  "priorityRank",
  "sourceKind",
  "extensions",
]);

/**
 * T2 — closed allowlist. Drops forbidden / unknown keys.
 */
export function sanitizeStructuralPayload(
  raw: unknown,
): ContinuityStructuralPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  for (const k of Object.keys(obj)) {
    if (FORBIDDEN_PAYLOAD_KEYS.has(k)) {
      // strip by omission below; mark invalid if only forbidden present
    }
  }

  const out: ContinuityStructuralPayload = {};
  if (Array.isArray(obj.medications)) {
    const meds: ContinuityStructuralMedication[] = [];
    for (const entry of obj.medications) {
      if (!entry || typeof entry !== "object") continue;
      const m = entry as Record<string, unknown>;
      const name = String(m.name ?? "").trim();
      if (!name) continue;
      const med: ContinuityStructuralMedication = { name };
      if (typeof m.drugPresentationId === "string" && m.drugPresentationId) {
        med.drugPresentationId = m.drugPresentationId;
      }
      for (const k of [
        "dosage",
        "frequency",
        "duration",
        "route",
        "instructions",
      ] as const) {
        if (typeof m[k] === "string" && m[k]) med[k] = m[k] as string;
      }
      meds.push(med);
    }
    if (meds.length) out.medications = meds;
  }
  if ("diagnosis" in obj) {
    out.diagnosis =
      obj.diagnosis === null || obj.diagnosis === undefined
        ? null
        : String(obj.diagnosis);
  }
  if ("notes" in obj) {
    out.notes =
      obj.notes === null || obj.notes === undefined
        ? null
        : String(obj.notes);
  }
  if (typeof obj.sourceChainId === "string" && obj.sourceChainId) {
    out.sourceChainId = obj.sourceChainId;
  }
  if (typeof obj.sourceVersionId === "string" && obj.sourceVersionId) {
    out.sourceVersionId = obj.sourceVersionId;
  }

  if (
    !out.medications?.length &&
    out.diagnosis == null &&
    out.notes == null &&
    !out.sourceChainId &&
    !out.sourceVersionId
  ) {
    return null;
  }
  return out;
}

export function structuralPayloadHasForbiddenKeys(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  return Object.keys(raw as object).some((k) => FORBIDDEN_PAYLOAD_KEYS.has(k));
}
