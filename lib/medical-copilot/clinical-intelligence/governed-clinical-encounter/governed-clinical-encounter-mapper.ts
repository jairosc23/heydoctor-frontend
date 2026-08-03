import {
  GOVERNED_CLINICAL_ENCOUNTER_GOVERNANCE,
  type GovernedClinicalEncounterComponentKey,
  type GovernedClinicalEncounterComponentPresence,
  type GovernedClinicalEncounterResult,
} from "./governed-clinical-encounter";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalEncounterComponentKey;
  label: string;
}> = [
  { key: "documentationPackage", label: "Documentation Package" },
  { key: "clinicalAssistance", label: "Assistant" },
  { key: "intelligenceRuntime", label: "Intelligence Runtime" },
  { key: "clinicalContext", label: "Clinical Context" },
  { key: "clinicalPlan", label: "Clinical Plan" },
  { key: "clinicalOutput", label: "Clinical Output" },
  { key: "reviewSession", label: "Review Session" },
  { key: "physicianDecisionWorkspace", label: "Physician Decision Workspace" },
];

export function mapGovernedClinicalEncounterEnvelope(
  payload: unknown,
): GovernedClinicalEncounterResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.documentationPackage !== undefined ||
    root.clinicalAssistance !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalEncounterComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    documentationPackage: data.documentationPackage ?? null,
    clinicalAssistance: data.clinicalAssistance ?? null,
    intelligenceRuntime: data.intelligenceRuntime ?? null,
    clinicalContext: data.clinicalContext ?? null,
    clinicalPlan: data.clinicalPlan ?? null,
    clinicalOutput: data.clinicalOutput ?? null,
    reviewSession: data.reviewSession ?? null,
    physicianDecisionWorkspace: data.physicianDecisionWorkspace ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ENCOUNTER_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
