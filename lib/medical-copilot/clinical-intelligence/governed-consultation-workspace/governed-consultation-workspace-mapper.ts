import {
  GOVERNED_CONSULTATION_WORKSPACE_GOVERNANCE,
  type GovernedConsultationWorkspaceComponentKey,
  type GovernedConsultationWorkspaceComponentPresence,
  type GovernedConsultationWorkspaceResult,
} from "./governed-consultation-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedConsultationWorkspaceComponentKey;
  label: string;
}> = [
  { key: "consultationReview", label: "Consultation Review" },
  { key: "clinicalEncounter", label: "Clinical Encounter" },
];

export function mapGovernedConsultationWorkspaceEnvelope(
  payload: unknown,
): GovernedConsultationWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationReview !== undefined ||
    root.clinicalEncounter !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedConsultationWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationReview: data.consultationReview ?? null,
    clinicalEncounter: data.clinicalEncounter ?? null,
    components,
    governance: { ...GOVERNED_CONSULTATION_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
