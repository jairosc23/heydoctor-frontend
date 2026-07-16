import {
  GOVERNED_CONSULTATION_DASHBOARD_GOVERNANCE,
  type GovernedConsultationDashboardComponentKey,
  type GovernedConsultationDashboardComponentPresence,
  type GovernedConsultationDashboardResult,
} from "./governed-consultation-dashboard";

const COMPONENT_DEFS: Array<{
  key: GovernedConsultationDashboardComponentKey;
  label: string;
}> = [
  { key: "clinicalWorkspaceConsolidation", label: "Clinical Workspace Consolidation" },
  { key: "consultationRuntime", label: "Consultation Runtime" },
];

export function mapGovernedConsultationDashboardEnvelope(
  payload: unknown,
): GovernedConsultationDashboardResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalWorkspaceConsolidation !== undefined ||
    root.consultationRuntime !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedConsultationDashboardComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalWorkspaceConsolidation: data.clinicalWorkspaceConsolidation ?? null,
    consultationRuntime: data.consultationRuntime ?? null,
    components,
    governance: { ...GOVERNED_CONSULTATION_DASHBOARD_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
