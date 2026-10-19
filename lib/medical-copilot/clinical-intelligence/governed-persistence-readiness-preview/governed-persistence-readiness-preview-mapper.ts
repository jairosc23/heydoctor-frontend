import {
  GOVERNED_PERSISTENCE_READINESS_PREVIEW_GOVERNANCE,
  type GovernedPersistenceReadinessPreviewComponentKey,
  type GovernedPersistenceReadinessPreviewComponentPresence,
  type GovernedPersistenceReadinessPreviewResult,
} from "./governed-persistence-readiness-preview";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessPreviewComponentKey;
  label: string;
}> = [
  { key: "persistenceReadinessRuntime", label: "Persistence Readiness Runtime" },
  { key: "persistencePreview", label: "Persistence Preview" },
];

export function mapGovernedPersistenceReadinessPreviewEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessPreviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReadinessRuntime !== undefined ||
    root.persistencePreview !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessPreviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReadinessRuntime: data.persistenceReadinessRuntime ?? null,
    persistencePreview: data.persistencePreview ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_PREVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
