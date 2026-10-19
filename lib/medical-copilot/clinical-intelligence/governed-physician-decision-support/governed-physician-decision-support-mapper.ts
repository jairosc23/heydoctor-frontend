import { GOVERNED_CLINICAL_EVIDENCE_UI_GOVERNANCE, type GovernedPhysicianDecisionSupportComponentKey, type GovernedPhysicianDecisionSupportComponentPresence, type GovernedPhysicianDecisionSupportResult } from "./governed-physician-decision-support";

const COMPONENT_DEFS: Array<{ key: GovernedPhysicianDecisionSupportComponentKey; label: string }> = [
  { key: "decisionSupport", label: "Decision Support" },
  { key: "evidence", label: "Evidence" },
  { key: "governance", label: "Governance" },
  { key: "hitl", label: "HITL" },
];

export function mapGovernedPhysicianDecisionSupportEnvelope(payload: unknown): GovernedPhysicianDecisionSupportResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.governance !== undefined || root.items !== undefined || root.runtime !== undefined || root.status !== undefined || root.surfacesPresent !== undefined || root.evidenceMapping !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const items = Array.isArray(data.items) ? data.items : [];
  const surfaces = [
    data.evidenceMapping,
    data.evidenceTrace,
    data.evidenceConfidence,
    data.clinicalExplainability,
    data.clinicalJustification,
    data.physicianDecisionSupport,
    data.clinicalSafetyChecks,
    data.recommendationValidation,
  ].filter(Boolean);

  const components: GovernedPhysicianDecisionSupportComponentPresence[] = COMPONENT_DEFS.map(({ key, label }) => {
    let present = false;
    if (key === "decisionSupport") present = items.length > 0 || surfaces.length > 0 || data.kind != null || data.evidenceMapping != null;
    else if (key === "evidence") present = items.length > 0 || surfaces.length > 0 || data.kind != null || data.evidenceMapping != null;
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
    governance: { ...GOVERNED_CLINICAL_EVIDENCE_UI_GOVERNANCE },
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
