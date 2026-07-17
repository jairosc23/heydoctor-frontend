import {
  GOVERNED_CLINICAL_NAVIGATION_GOVERNANCE,
  type GovernedClinicalNavigationComponentKey,
  type GovernedClinicalNavigationComponentPresence,
  type GovernedClinicalNavigationResult,
} from "./governed-clinical-navigation";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalNavigationComponentKey;
  label: string;
}> = [
  { key: "encounterTimeline", label: "Encounter Timeline" },
  { key: "clinicalWorkspace", label: "Clinical Workspace" },
];

export function mapGovernedClinicalNavigationEnvelope(
  payload: unknown,
): GovernedClinicalNavigationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.encounterTimeline !== undefined ||
    root.clinicalWorkspace !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalNavigationComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    encounterTimeline: data.encounterTimeline ?? null,
    clinicalWorkspace: data.clinicalWorkspace ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_NAVIGATION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
