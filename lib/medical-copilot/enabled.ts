/**
 * RC-2 P0-1 — Medical Copilot kill switch / feature flag.
 * Disables only Medical Copilot UI entry — never consultation, EMR, or auth.
 *
 * Priority:
 * 1) Runtime localStorage `hd_mc_kill_switch` (reversible without redeploy)
 * 2) Env `NEXT_PUBLIC_MEDICAL_COPILOT` (0/false/off → disabled; unset → enabled)
 */

const TRUTHY = new Set(["1", "true", "yes", "on"]);
const FALSY = new Set(["0", "false", "no", "off"]);

export const MEDICAL_COPILOT_KILL_SWITCH_STORAGE_KEY = "hd_mc_kill_switch";

export function parseMedicalCopilotEnvFlag(
  raw: string | undefined,
): boolean {
  if (raw == null || raw.trim() === "") return true;
  const v = raw.trim().toLowerCase();
  if (FALSY.has(v)) return false;
  if (TRUTHY.has(v)) return true;
  return true;
}

/**
 * Runtime kill switch: `true` means Copilot must stay disabled.
 */
export function readMedicalCopilotRuntimeKillSwitch(
  storage?: Pick<Storage, "getItem"> | null,
): boolean | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(MEDICAL_COPILOT_KILL_SWITCH_STORAGE_KEY);
    if (raw == null) return null;
    const v = raw.trim().toLowerCase();
    if (TRUTHY.has(v) || v === "kill") return true;
    if (FALSY.has(v)) return false;
    return null;
  } catch {
    return null;
  }
}

export function setMedicalCopilotRuntimeKillSwitch(
  active: boolean,
  storage?: Pick<Storage, "setItem" | "removeItem"> | null,
): void {
  if (!storage) return;
  try {
    if (active) {
      storage.setItem(MEDICAL_COPILOT_KILL_SWITCH_STORAGE_KEY, "1");
    } else {
      storage.removeItem(MEDICAL_COPILOT_KILL_SWITCH_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export type MedicalCopilotEnabledOptions = {
  env?: string | undefined;
  storage?: Pick<Storage, "getItem"> | null;
};

/**
 * Returns true when Medical Copilot surfaces may render.
 * Default: enabled. Kill switch / env off → disabled.
 */
export function isMedicalCopilotEnabled(
  options: MedicalCopilotEnabledOptions = {},
): boolean {
  const storage =
    options.storage !== undefined
      ? options.storage
      : typeof window !== "undefined"
        ? window.localStorage
        : null;
  const runtime = readMedicalCopilotRuntimeKillSwitch(storage);
  if (runtime === true) return false;
  if (runtime === false) return true;

  return parseMedicalCopilotEnvFlag(
    options.env !== undefined
      ? options.env
      : process.env.NEXT_PUBLIC_MEDICAL_COPILOT,
  );
}
