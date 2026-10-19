import { GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE, type GovernedSpecializedClinicalIntelligencePackageComponentKey, type GovernedSpecializedClinicalIntelligencePackageComponentPresence, type GovernedSpecializedClinicalIntelligencePackageResult } from "./governed-specialized-clinical-intelligence-package";
const COMPONENT_DEFS: Array<{ key: GovernedSpecializedClinicalIntelligencePackageComponentKey; label: string }> = [
  { key: "package", label: "Package" },
  { key: "specialty", label: "Specialty" },
  { key: "governance", label: "Governance" },
  { key: "hitl", label: "HITL" },
];
export function mapGovernedSpecializedClinicalIntelligencePackageEnvelope(payload: unknown): GovernedSpecializedClinicalIntelligencePackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.governance !== undefined || root.items !== undefined || root.runtime !== undefined || root.status !== undefined || root.surfacesPresent !== undefined || root.cardiovascularRiskEngine !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;
  const items = Array.isArray(data.items) ? data.items : [];
  const surfaces = [
    data.cardiovascularRiskEngine, data.diabetesCareEngine, data.hypertensionManagementEngine,
    data.renalRiskEngine, data.polypharmacyAnalysisEngine, data.preventiveHealthEngine,
    data.geriatricAssessmentEngine, data.pediatricSafetyEngine, data.womensHealthReviewEngine,
  ].filter(Boolean);
  const components: GovernedSpecializedClinicalIntelligencePackageComponentPresence[] = COMPONENT_DEFS.map(({ key, label }) => {
    let present = false;
    if (key === "package") present = data.runtime != null || data.packageId != null || data.surfacesPresent != null;
    else if (key === "specialty") present = items.length > 0 || surfaces.length > 0 || data.kind != null || data.cardiovascularRiskEngine != null;
    else if (key === "governance") present = data.governance != null;
    else if (key === "hitl") present = true;
    return { key, label, present, readOnly: true as const, persisted: false as const };
  });
  return {
    payload: data,
    status: typeof data.status === "string" ? data.status : null,
    title: typeof data.title === "string" ? data.title : null,
    itemCount: items.length > 0 ? items.length : surfaces.length,
    components,
    governance: { ...GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true, persisted: false, writesEmr: false, repositoryInvoked: false, executesAction: false, draftApproved: false, automaticDecision: false,
  };
}
