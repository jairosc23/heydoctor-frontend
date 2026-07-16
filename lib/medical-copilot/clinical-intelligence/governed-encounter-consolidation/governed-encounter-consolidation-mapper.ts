import {
  GOVERNED_ENCOUNTER_CONSOLIDATION_GOVERNANCE,
  type GovernedEncounterConsolidationComponentKey,
  type GovernedEncounterConsolidationComponentPresence,
  type GovernedEncounterConsolidationResult,
} from "./governed-encounter-consolidation";

const COMPONENT_DEFS: Array<{
  key: GovernedEncounterConsolidationComponentKey;
  label: string;
}> = [
  { key: "encounterSnapshot", label: "Encounter Snapshot" },
  { key: "documentationPackage", label: "Documentation Package" },
  { key: "physicianWorkspace", label: "Physician Workspace" },
];

export function mapGovernedEncounterConsolidationEnvelope(
  payload: unknown,
): GovernedEncounterConsolidationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.encounterSnapshot !== undefined ||
    root.documentationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedEncounterConsolidationComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    encounterSnapshot: data.encounterSnapshot ?? null,
    documentationPackage: data.documentationPackage ?? null,
    physicianWorkspace: data.physicianWorkspace ?? null,
    components,
    governance: { ...GOVERNED_ENCOUNTER_CONSOLIDATION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
