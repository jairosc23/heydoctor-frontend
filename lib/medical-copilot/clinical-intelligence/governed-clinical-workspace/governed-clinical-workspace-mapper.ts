import {
  GOVERNED_CLINICAL_WORKSPACE_GOVERNANCE,
  type GovernedClinicalWorkspaceComponentKey,
  type GovernedClinicalWorkspaceComponentPresence,
  type GovernedClinicalWorkspaceResult,
} from "./governed-clinical-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalWorkspaceComponentKey;
  label: string;
}> = [
  { key: "consultationPackage", label: "Consultation Package" },
  { key: "clinicalEncounter", label: "Clinical Encounter" },
  { key: "documentationPackage", label: "Documentation Package" },
];

export function mapGovernedClinicalWorkspaceEnvelope(
  payload: unknown,
): GovernedClinicalWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationPackage !== undefined ||
    root.clinicalEncounter !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationPackage: data.consultationPackage ?? null,
    clinicalEncounter: data.clinicalEncounter ?? null,
    documentationPackage: data.documentationPackage ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
