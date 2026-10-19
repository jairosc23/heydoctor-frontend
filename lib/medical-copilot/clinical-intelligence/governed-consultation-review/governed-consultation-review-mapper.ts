import {
  GOVERNED_CONSULTATION_REVIEW_GOVERNANCE,
  type GovernedConsultationReviewComponentKey,
  type GovernedConsultationReviewComponentPresence,
  type GovernedConsultationReviewResult,
} from "./governed-consultation-review";

const COMPONENT_DEFS: Array<{
  key: GovernedConsultationReviewComponentKey;
  label: string;
}> = [
  { key: "consultationSnapshot", label: "Consultation Snapshot" },
  { key: "physicianWorkspace", label: "Physician Workspace" },
  { key: "documentationPackage", label: "Documentation Package" },
];

export function mapGovernedConsultationReviewEnvelope(
  payload: unknown,
): GovernedConsultationReviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationSnapshot !== undefined ||
    root.physicianWorkspace !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedConsultationReviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationSnapshot: data.consultationSnapshot ?? null,
    physicianWorkspace: data.physicianWorkspace ?? null,
    documentationPackage: data.documentationPackage ?? null,
    components,
    governance: { ...GOVERNED_CONSULTATION_REVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
