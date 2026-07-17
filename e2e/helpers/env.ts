/**
 * PQ-01 — E2E environment contract (P0).
 * No secrets in source; values come from `.env.e2e` or CI repository secrets.
 */

export const E2E_ENV_KEYS = [
  "E2E_BASE_URL",
  "E2E_DOCTOR_EMAIL",
  "E2E_DOCTOR_PASSWORD",
  "E2E_CONSULTATION_HTA",
  "E2E_CONSULTATION_DM2",
  "E2E_CONSULTATION_ACUTE",
  "E2E_CONSULTATION_PAYMENT",
] as const;

export type E2EEnvKey = (typeof E2E_ENV_KEYS)[number];

/** Auth triad required to attempt login. */
export function isE2EAuthReady(): boolean {
  return Boolean(
    process.env.E2E_BASE_URL?.trim() &&
      process.env.E2E_DOCTOR_EMAIL?.trim() &&
      process.env.E2E_DOCTOR_PASSWORD?.trim(),
  );
}

/** All 7 secrets present (CI full P0 gate). */
export function isE2EFullReady(): boolean {
  return E2E_ENV_KEYS.every((key) => Boolean(process.env[key]?.trim()));
}

export function missingE2EKeys(): string[] {
  return E2E_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

/**
 * Strict mode: CI or E2E_STRICT=1.
 * Missing consultation IDs throw instead of soft-skip when auth is ready.
 */
export function isE2EStrict(): boolean {
  return process.env.E2E_STRICT === "1" || process.env.CI === "true";
}

export function getEnv(key: E2EEnvKey): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

/**
 * Resolve a consultation UUID for a P0 case.
 * Soft-skip path returns undefined when not strict; strict throws if auth ready.
 */
export function getConsultationId(
  key:
    | "E2E_CONSULTATION_HTA"
    | "E2E_CONSULTATION_DM2"
    | "E2E_CONSULTATION_ACUTE"
    | "E2E_CONSULTATION_PAYMENT",
): string | undefined {
  const value = getEnv(key);
  if (value) return value;
  if (isE2EStrict() && isE2EAuthReady()) {
    throw new Error(
      `[PQ-01] Missing ${key} while E2E strict/CI mode is active. Configure the secret or disable E2E_STRICT.`,
    );
  }
  return undefined;
}

export function baseURL(): string {
  return getEnv("E2E_BASE_URL") ?? "http://localhost:3000";
}
