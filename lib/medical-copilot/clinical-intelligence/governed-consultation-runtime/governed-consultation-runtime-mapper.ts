import {
  GOVERNED_CONSULTATION_RUNTIME_GOVERNANCE,
  type GovernedConsultationRuntimeComponentKey,
  type GovernedConsultationRuntimeComponentPresence,
  type GovernedConsultationRuntimeResult,
} from "./governed-consultation-runtime";

const COMPONENT_DEFS: Array<{
  key: GovernedConsultationRuntimeComponentKey;
  label: string;
}> = [
  { key: "clinicalEncounter", label: "Clinical Encounter" },
  { key: "physicianWorkspace", label: "Physician Workspace" },
  { key: "documentationPackage", label: "Documentation Package" },
];

export function mapGovernedConsultationRuntimeEnvelope(
  payload: unknown,
): GovernedConsultationRuntimeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalEncounter !== undefined ||
    root.physicianWorkspace !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedConsultationRuntimeComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalEncounter: data.clinicalEncounter ?? null,
    physicianWorkspace: data.physicianWorkspace ?? null,
    documentationPackage: data.documentationPackage ?? null,
    components,
    governance: { ...GOVERNED_CONSULTATION_RUNTIME_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
