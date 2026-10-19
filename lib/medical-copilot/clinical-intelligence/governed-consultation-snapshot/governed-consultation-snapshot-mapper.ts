import {
  GOVERNED_CONSULTATION_SNAPSHOT_GOVERNANCE,
  type GovernedConsultationSnapshotComponentKey,
  type GovernedConsultationSnapshotComponentPresence,
  type GovernedConsultationSnapshotResult,
} from "./governed-consultation-snapshot";

const COMPONENT_DEFS: Array<{
  key: GovernedConsultationSnapshotComponentKey;
  label: string;
}> = [
  { key: "consultationRuntime", label: "Consultation Runtime" },
  { key: "clinicalContext", label: "Clinical Context" },
  { key: "clinicalPlan", label: "Clinical Plan" },
  { key: "reviewSession", label: "Review Session" },
];

export function mapGovernedConsultationSnapshotEnvelope(
  payload: unknown,
): GovernedConsultationSnapshotResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationRuntime !== undefined ||
    root.clinicalContext !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedConsultationSnapshotComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationRuntime: data.consultationRuntime ?? null,
    clinicalContext: data.clinicalContext ?? null,
    clinicalPlan: data.clinicalPlan ?? null,
    reviewSession: data.reviewSession ?? null,
    components,
    governance: { ...GOVERNED_CONSULTATION_SNAPSHOT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
