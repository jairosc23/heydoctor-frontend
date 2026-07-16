import {
  GOVERNED_CONSULTATION_PACKAGE_GOVERNANCE,
  type GovernedConsultationPackageComponentKey,
  type GovernedConsultationPackageComponentPresence,
  type GovernedConsultationPackageResult,
} from "./governed-consultation-package";

const COMPONENT_DEFS: Array<{
  key: GovernedConsultationPackageComponentKey;
  label: string;
}> = [
  { key: "encounterConsolidation", label: "Encounter Consolidation" },
  { key: "clinicalEncounter", label: "Clinical Encounter" },
  { key: "documentationPackage", label: "Documentation Package" },
  { key: "clinicalAssistance", label: "Clinical Assistance" },
  { key: "intelligenceRuntime", label: "Clinical Intelligence Runtime" },
];

export function mapGovernedConsultationPackageEnvelope(
  payload: unknown,
): GovernedConsultationPackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.encounterConsolidation !== undefined ||
    root.clinicalEncounter !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedConsultationPackageComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    encounterConsolidation: data.encounterConsolidation ?? null,
    clinicalEncounter: data.clinicalEncounter ?? null,
    documentationPackage: data.documentationPackage ?? null,
    clinicalAssistance: data.clinicalAssistance ?? null,
    intelligenceRuntime: data.intelligenceRuntime ?? null,
    components,
    governance: { ...GOVERNED_CONSULTATION_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
