import { GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE, type GovernedWomensHealthReviewEngineComponentKey, type GovernedWomensHealthReviewEngineComponentPresence, type GovernedWomensHealthReviewEngineResult } from "./governed-womens-health-review-engine";
const COMPONENT_DEFS: Array<{ key: GovernedWomensHealthReviewEngineComponentKey; label: string }> = [
  { key: "engine", label: "Engine" },
  { key: "specialty", label: "Specialty" },
  { key: "governance", label: "Governance" },
  { key: "hitl", label: "HITL" },
];
export function mapGovernedWomensHealthReviewEngineEnvelope(payload: unknown): GovernedWomensHealthReviewEngineResult | null {
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
  const components: GovernedWomensHealthReviewEngineComponentPresence[] = COMPONENT_DEFS.map(({ key, label }) => {
    let present = false;
    if (key === "engine") present = items.length > 0 || surfaces.length > 0 || data.kind != null || data.cardiovascularRiskEngine != null;
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
