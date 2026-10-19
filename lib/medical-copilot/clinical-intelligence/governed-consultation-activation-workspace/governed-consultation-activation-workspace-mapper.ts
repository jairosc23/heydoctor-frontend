import {
  GOVERNED_CONSULTATION_ACTIVATION_WORKSPACE_GOVERNANCE,
  type GovernedConsultationActivationWorkspaceComponentKey,
  type GovernedConsultationActivationWorkspaceComponentPresence,
  type GovernedConsultationActivationWorkspaceResult,
} from "./governed-consultation-activation-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedConsultationActivationWorkspaceComponentKey;
  label: string;
}> = [
  { key: "physicianActivationWorkspace", label: "Physician Activation Workspace" },
  { key: "consultationPackage", label: "Consultation Package" },
];

export function mapGovernedConsultationActivationWorkspaceEnvelope(
  payload: unknown,
): GovernedConsultationActivationWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.physicianActivationWorkspace !== undefined ||
    root.consultationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedConsultationActivationWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    physicianActivationWorkspace: data.physicianActivationWorkspace ?? null,
    consultationPackage: data.consultationPackage ?? null,
    components,
    governance: { ...GOVERNED_CONSULTATION_ACTIVATION_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
