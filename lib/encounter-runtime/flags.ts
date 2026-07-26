const TRUTHY = new Set(["1", "true", "yes", "on"]);

function envTruthy(raw: string | undefined): boolean {
  if (!raw) return false;
  return TRUTHY.has(raw.trim().toLowerCase());
}

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
