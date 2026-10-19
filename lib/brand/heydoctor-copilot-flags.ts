/**
 * HeyDoctor Copilot Workspace runtime flags (P0).
 * Default: lazy bootstrap — no MC session API tax until Workspace opens.
 */

/** When "1", bootstrap session on Encounter mount (opt-in only). */
export function isHeyDoctorCopilotEagerBootstrapEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HEYDOCTOR_COPILOT_EAGER_BOOTSTRAP === "1";
}
