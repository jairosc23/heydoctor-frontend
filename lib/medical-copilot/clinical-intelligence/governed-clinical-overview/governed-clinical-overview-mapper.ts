import {
  GOVERNED_CLINICAL_OVERVIEW_GOVERNANCE,
  type GovernedClinicalOverviewComponentKey,
  type GovernedClinicalOverviewComponentPresence,
  type GovernedClinicalOverviewResult,
} from "./governed-clinical-overview";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalOverviewComponentKey;
  label: string;
}> = [
  { key: "clinicalSessionDashboard", label: "Clinical Session Dashboard" },
  { key: "documentationPackage", label: "Documentation Package" },
];

export function mapGovernedClinicalOverviewEnvelope(
  payload: unknown,
): GovernedClinicalOverviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalSessionDashboard !== undefined ||
    root.documentationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalOverviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalSessionDashboard: data.clinicalSessionDashboard ?? null,
    documentationPackage: data.documentationPackage ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_OVERVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
