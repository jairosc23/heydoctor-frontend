import { envTruthy } from "@/lib/env-truthy";

/** Mount Encounter Runtime host + plugin slot. Default off in production. */
export function isGceEncounterRuntimeEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_GCE_ENCOUNTER_RUNTIME,
): boolean {
  return envTruthy(raw);
}

/** Register/mount medical-copilot-assist plugin. Default off until Runtime stable. */
export function isGceCopilotAssistEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_GCE_COPILOT_ASSIST,
): boolean {
  return envTruthy(raw);
}

/**
 * W1 E01/E05 — workspace host + clinical context fail-closed UX.
 * Hides incomplete shell by default; NEVER disables BE fail-closed.
 */
export function isCosW1WorkspaceHostEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_COS_W1_WORKSPACE_HOST,
): boolean {
  return envTruthy(raw);
}

/**
 * W1 E03 — Consultation Journey navigator chrome.
 * Default off; NEVER disables BE journey graph enforcement.
 */
export function isCosW1JourneyEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_COS_W1_JOURNEY,
): boolean {
  return envTruthy(raw);
}
