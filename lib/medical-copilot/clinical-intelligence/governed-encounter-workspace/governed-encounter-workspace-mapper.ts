import {
  GOVERNED_ENCOUNTER_WORKSPACE_GOVERNANCE,
  type GovernedEncounterWorkspaceComponentKey,
  type GovernedEncounterWorkspaceComponentPresence,
  type GovernedEncounterWorkspaceResult,
} from "./governed-encounter-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedEncounterWorkspaceComponentKey;
  label: string;
}> = [
  { key: "consultationWorkspace", label: "Consultation Workspace" },
  { key: "documentationPackage", label: "Documentation Package" },
];

export function mapGovernedEncounterWorkspaceEnvelope(
  payload: unknown,
): GovernedEncounterWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationWorkspace !== undefined ||
    root.documentationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedEncounterWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationWorkspace: data.consultationWorkspace ?? null,
    documentationPackage: data.documentationPackage ?? null,
    components,
    governance: { ...GOVERNED_ENCOUNTER_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
