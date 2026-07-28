import type { JourneyStage } from "./types";

/** Client-side mirror of hard-denied edges (NFR dual validation). BE is SSOT. */
const HARD_DENY = new Set([
  "Assisting->AwaitingConfirmation",
  "Assisting->ExecutingOwnedPath",
  "Assisting->Completed",
  "DisposingAssist->AwaitingConfirmation",
  "DisposingAssist->ExecutingOwnedPath",
  "DisposingAssist->Completed",
  "Exploring->AwaitingConfirmation",
  "Exploring->ExecutingOwnedPath",
]);

export function isClientHardDeniedJourneyTransition(
  from: JourneyStage,
  to: JourneyStage,
): boolean {
  return HARD_DENY.has(`${from}->${to}`);
}
