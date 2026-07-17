import {
  GOVERNED_CLINICAL_SESSION_DASHBOARD_GOVERNANCE,
  type GovernedClinicalSessionDashboardComponentKey,
  type GovernedClinicalSessionDashboardComponentPresence,
  type GovernedClinicalSessionDashboardResult,
} from "./governed-clinical-session-dashboard";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalSessionDashboardComponentKey;
  label: string;
}> = [
  { key: "clinicalDashboard", label: "Clinical Dashboard" },
  { key: "reviewSession", label: "Review Session" },
  { key: "consultationPackage", label: "Consultation Package" },
];

export function mapGovernedClinicalSessionDashboardEnvelope(
  payload: unknown,
): GovernedClinicalSessionDashboardResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalDashboard !== undefined ||
    root.reviewSession !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalSessionDashboardComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalDashboard: data.clinicalDashboard ?? null,
    reviewSession: data.reviewSession ?? null,
    consultationPackage: data.consultationPackage ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_SESSION_DASHBOARD_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
