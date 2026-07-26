/** Phase 4.2 — Clinical Action Workspace™ feature flag and module registry (shell). */

export type ClinicalActionModuleId =
  | "prescriptions"
  | "lab"
  | "referrals"
  | "invoices"
  | "documents"
  | "orders";

export interface ClinicalActionModuleDefinition {
  id: ClinicalActionModuleId;
  label: string;
  icon: string;
}

export const CLINICAL_ACTION_MODULES: ClinicalActionModuleDefinition[] = [
  { id: "prescriptions", label: "Recetas", icon: "💊" },
  { id: "lab", label: "Laboratorio", icon: "🧪" },
  { id: "referrals", label: "Interconsulta", icon: "👨‍⚕️" },
  { id: "invoices", label: "Facturas", icon: "💰" },
  { id: "documents", label: "Documentos", icon: "📄" },
  { id: "orders", label: "Órdenes", icon: "📋" },
];

const TRUTHY = new Set(["1", "true", "yes", "on"]);

export function isClinicalActionWorkspaceEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE,
): boolean {
  if (!raw) return false;
  return TRUTHY.has(raw.trim().toLowerCase());
}

/** GCE-W2 — Encounter Runtime host (default off). Re-export for workspace discoverability. */
export {
  isGceCopilotAssistEnabled,
  isGceEncounterRuntimeEnabled,
} from "@/lib/encounter-runtime/flags";

export function clinicalActionModuleLabel(id: ClinicalActionModuleId): string {
  return (
    CLINICAL_ACTION_MODULES.find((module) => module.id === id)?.label ?? id
  );
}
