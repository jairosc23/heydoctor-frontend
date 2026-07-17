import {
  GOVERNED_PERSISTENCE_SESSION_GOVERNANCE,
  type GovernedPersistenceSessionComponentKey,
  type GovernedPersistenceSessionComponentPresence,
  type GovernedPersistenceSessionResult,
} from "./governed-persistence-session";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceSessionComponentKey;
  label: string;
}> = [
  { key: "persistenceDashboard", label: "Persistence Dashboard" },
  { key: "clinicalActivationSession", label: "Clinical Activation Session" },
];

export function mapGovernedPersistenceSessionEnvelope(
  payload: unknown,
): GovernedPersistenceSessionResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceDashboard !== undefined ||
    root.clinicalActivationSession !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceSessionComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceDashboard: data.persistenceDashboard ?? null,
    clinicalActivationSession: data.clinicalActivationSession ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_SESSION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
