/**
 * GCE-W2 — Frozen ClinicalPluginManifest (additive-only in future waves).
 */

export type ClinicalPluginSlot =
  | "assist"
  | "summary"
  | "knowledge"
  | "documentation"
  | "analytics";

export type ClinicalPluginPermission =
  | "context:read"
  | "continuity:read"
  | "copilot:suggest"
  | "summary:read"
  | "knowledge:read";

const ALLOWED_PERMISSIONS = new Set<ClinicalPluginPermission>([
  "context:read",
  "continuity:read",
  "copilot:suggest",
  "summary:read",
  "knowledge:read",
]);

export type ClinicalPluginManifest = {
  id: string;
  version: string;
  displayName: string;
  slot: ClinicalPluginSlot;
  priority: number;
  permissions: ClinicalPluginPermission[];
  hitlRequired: true;
  executesAction: false;
  writesEmr: false;
  writesPrescription: false;
  requiresNetwork: boolean;
  description?: string;
};

export type ManifestValidationResult =
  | { ok: true; manifest: ClinicalPluginManifest }
  | { ok: false; reason: string };

export function validateClinicalPluginManifest(
  input: unknown,
): ManifestValidationResult {
  if (!input || typeof input !== "object") {
    return { ok: false, reason: "manifest_not_object" };
  }
  const m = input as Record<string, unknown>;
  if (typeof m.id !== "string" || !m.id.trim()) {
    return { ok: false, reason: "invalid_id" };
  }
  if (typeof m.version !== "string" || !m.version.trim()) {
    return { ok: false, reason: "invalid_version" };
  }
  if (typeof m.displayName !== "string" || !m.displayName.trim()) {
    return { ok: false, reason: "invalid_displayName" };
  }
  if (m.hitlRequired !== true) {
    return { ok: false, reason: "hitlRequired_must_be_true" };
  }
  if (m.executesAction !== false) {
    return { ok: false, reason: "executesAction_must_be_false" };
  }
  if (m.writesEmr !== false) {
    return { ok: false, reason: "writesEmr_must_be_false" };
  }
  if (m.writesPrescription !== false) {
    return { ok: false, reason: "writesPrescription_must_be_false" };
  }
  if (!Array.isArray(m.permissions)) {
    return { ok: false, reason: "permissions_must_be_array" };
  }
  for (const p of m.permissions) {
    if (typeof p !== "string" || !ALLOWED_PERMISSIONS.has(p as ClinicalPluginPermission)) {
      return { ok: false, reason: `permission_forbidden:${String(p)}` };
    }
  }
  const slots: ClinicalPluginSlot[] = [
    "assist",
    "summary",
    "knowledge",
    "documentation",
    "analytics",
  ];
  if (typeof m.slot !== "string" || !slots.includes(m.slot as ClinicalPluginSlot)) {
    return { ok: false, reason: "invalid_slot" };
  }
  if (typeof m.priority !== "number" || !Number.isFinite(m.priority)) {
    return { ok: false, reason: "invalid_priority" };
  }
  if (typeof m.requiresNetwork !== "boolean") {
    return { ok: false, reason: "invalid_requiresNetwork" };
  }

  return {
    ok: true,
    manifest: {
      id: m.id.trim(),
      version: m.version.trim(),
      displayName: m.displayName.trim(),
      slot: m.slot as ClinicalPluginSlot,
      priority: m.priority,
      permissions: m.permissions as ClinicalPluginPermission[],
      hitlRequired: true,
      executesAction: false,
      writesEmr: false,
      writesPrescription: false,
      requiresNetwork: m.requiresNetwork,
      description:
        typeof m.description === "string" ? m.description : undefined,
    },
  };
}
