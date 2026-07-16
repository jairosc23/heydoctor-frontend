import {
  GOVERNED_CLINICAL_ACTIVATION_DASHBOARD_GOVERNANCE,
  type GovernedClinicalActivationDashboardComponentKey,
  type GovernedClinicalActivationDashboardComponentPresence,
  type GovernedClinicalActivationDashboardResult,
} from "./governed-clinical-activation-dashboard";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalActivationDashboardComponentKey;
  label: string;
}> = [
  { key: "consultationActivationWorkspace", label: "Consultation Activation Workspace" },
  { key: "clinicalDashboard", label: "Clinical Dashboard" },
];

export function mapGovernedClinicalActivationDashboardEnvelope(
  payload: unknown,
): GovernedClinicalActivationDashboardResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationActivationWorkspace !== undefined ||
    root.clinicalDashboard !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalActivationDashboardComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationActivationWorkspace: data.consultationActivationWorkspace ?? null,
    clinicalDashboard: data.clinicalDashboard ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ACTIVATION_DASHBOARD_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
