import {
  GOVERNED_CLINICAL_DASHBOARD_GOVERNANCE,
  type GovernedClinicalDashboardComponentKey,
  type GovernedClinicalDashboardComponentPresence,
  type GovernedClinicalDashboardResult,
} from "./governed-clinical-dashboard";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalDashboardComponentKey;
  label: string;
}> = [
  { key: "physicianDashboard", label: "Physician Dashboard" },
  { key: "clinicalEncounter", label: "Clinical Encounter" },
];

export function mapGovernedClinicalDashboardEnvelope(
  payload: unknown,
): GovernedClinicalDashboardResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.physicianDashboard !== undefined ||
    root.clinicalEncounter !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalDashboardComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    physicianDashboard: data.physicianDashboard ?? null,
    clinicalEncounter: data.clinicalEncounter ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_DASHBOARD_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
