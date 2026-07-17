import { GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE, type GovernedVaccinationReviewComponentKey, type GovernedVaccinationReviewComponentPresence, type GovernedVaccinationReviewResult } from "./governed-vaccination-review";

const COMPONENT_DEFS: Array<{ key: GovernedVaccinationReviewComponentKey; label: string }> = [
  { key: "vaccination", label: "Vaccination" },
  { key: "intelligence", label: "Intelligence" },
  { key: "governance", label: "Governance" },
  { key: "hitl", label: "HITL" },
];

export function mapGovernedVaccinationReviewEnvelope(payload: unknown): GovernedVaccinationReviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.governance !== undefined || root.items !== undefined || root.runtime !== undefined || root.status !== undefined || root.surfacesPresent !== undefined || root.drugInteractionAnalysis !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const items = Array.isArray(data.items) ? data.items : [];
  const surfaces = [
    data.drugInteractionAnalysis,
    data.allergyCrossCheck,
    data.contraindicationAnalysis,
    data.clinicalRiskDetection,
    data.preventiveCareSuggestions,
    data.preventiveScreeningSuggestions,
    data.vaccinationReview,
    data.chronicDiseaseFollowUpAnalysis,
    data.clinicalAlertCenter,
  ].filter(Boolean);

  const components: GovernedVaccinationReviewComponentPresence[] = COMPONENT_DEFS.map(({ key, label }) => {
    let present = false;
    if (key === "vaccination") present = items.length > 0 || surfaces.length > 0 || data.kind != null || data.drugInteractionAnalysis != null;
    else if (key === "intelligence") present = items.length > 0 || surfaces.length > 0 || data.kind != null || data.drugInteractionAnalysis != null;
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
    governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
    repositoryInvoked: false,
    executesAction: false,
    draftApproved: false,
    automaticDecision: false,
  };
}
