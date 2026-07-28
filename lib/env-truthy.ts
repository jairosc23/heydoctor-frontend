/**
 * Shared truthy env parser for feature flags (chrome/UX only).
 * Never used to disable COS HAB / fail-closed clinical rules.
 */
const TRUTHY = new Set(["1", "true", "yes", "on"]);

export function envTruthy(raw: string | undefined): boolean {
  if (!raw) return false;
  return TRUTHY.has(raw.trim().toLowerCase());
}
