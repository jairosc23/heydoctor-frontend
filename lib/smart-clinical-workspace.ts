/** Phase 4.3 — Smart Clinical Workspace™ feature flag (layout/UX only). */

const TRUTHY = new Set(["1", "true", "yes", "on"]);

export function isSmartClinicalWorkspaceEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE,
): boolean {
  if (!raw) return false;
  return TRUTHY.has(raw.trim().toLowerCase());
}
