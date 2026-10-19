import {
  MEDICAL_COPILOT_GOVERNANCE,
  type MedicalCopilotActionSummary,
  type MedicalCopilotApiEnvelope,
  type MedicalCopilotGovernance,
  type MedicalCopilotTimelineEntry,
} from "./types";

export function assertMedicalCopilotGovernance(
  governance: MedicalCopilotGovernance | null | undefined,
): boolean {
  if (!governance) return false;
  return (
    governance.requiresPhysicianReview === true &&
    governance.executesAction === false &&
    governance.autoPersistedToEmr === false
  );
}

export function envelopeIsOk<T>(
  envelope: MedicalCopilotApiEnvelope<T> | null | undefined,
): boolean {
  return Boolean(
    envelope &&
      envelope.status === "ok" &&
      assertMedicalCopilotGovernance(envelope.governance),
  );
}

/** Stable empty list — callers must not mutate. */
export const EMPTY_ACTIONS: MedicalCopilotActionSummary[] = [];
Object.freeze(EMPTY_ACTIONS);

export function sortTimelineEntries(
  entries: MedicalCopilotTimelineEntry[] | null | undefined,
): MedicalCopilotTimelineEntry[] {
  if (!entries?.length) return [];
  return [...entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function actionableActions(
  actions: MedicalCopilotActionSummary[] | null | undefined,
): MedicalCopilotActionSummary[] {
  if (!actions?.length) return EMPTY_ACTIONS;
  const pending = actions.filter(
    (action) => action.status === "created" || action.status === "queued",
  );
  return pending.length === 0 ? EMPTY_ACTIONS : pending;
}

export function formatEventLabel(eventType: string): string {
  return eventType
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function defaultGovernance(): MedicalCopilotGovernance {
  return { ...MEDICAL_COPILOT_GOVERNANCE };
}
