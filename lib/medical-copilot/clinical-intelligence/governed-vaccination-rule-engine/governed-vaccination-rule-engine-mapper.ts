import { GOVERNED_DETERMINISTIC_CLINICAL_RULES_UI_GOVERNANCE, type GovernedVaccinationRuleEngineEvaluationView, type GovernedVaccinationRuleEngineResult } from "./governed-vaccination-rule-engine";

function mapEvaluation(raw: unknown): GovernedVaccinationRuleEngineEvaluationView | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.ruleId !== "string") return null;
  return {
    ruleId: e.ruleId,
    ruleName: typeof e.ruleName === "string" ? e.ruleName : e.ruleId,
    condition: typeof e.condition === "string" ? e.condition : "",
    result: typeof e.result === "string" ? e.result : "INSUFFICIENT_DATA",
    explanation: typeof e.explanation === "string" ? e.explanation : "",
    evidenceUsed: Array.isArray(e.evidenceUsed) ? e.evidenceUsed.map(String) : [],
    confidence: typeof e.confidence === "string" ? e.confidence : "low",
    priority: typeof e.priority === "string" ? e.priority : "medium",
  };
}

export function mapGovernedVaccinationRuleEngineEnvelope(payload: unknown): GovernedVaccinationRuleEngineResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.governance !== undefined || root.evaluations !== undefined || root.runtime !== undefined || root.enginesPresent !== undefined || root.drugInteractionRuleEngine !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  let evaluationsRaw: unknown[] = [];
  if (Array.isArray(data.evaluations)) evaluationsRaw = data.evaluations;
  else if (data.isPackage || data.drugInteractionRuleEngine) {
    const engines = [
      data.drugInteractionRuleEngine, data.allergyRuleEngine, data.contraindicationRuleEngine,
      data.clinicalRiskRuleEngine, data.preventiveCareRuleEngine, data.vaccinationRuleEngine,
      data.chronicDiseaseRuleEngine, data.clinicalAlertRuleEngine,
    ];
    for (const eng of engines) {
      if (eng && typeof eng === "object" && Array.isArray((eng as { evaluations?: unknown[] }).evaluations)) {
        evaluationsRaw.push(...((eng as { evaluations: unknown[] }).evaluations));
      }
    }
  }

  const evaluations = evaluationsRaw.map(mapEvaluation).filter((e): e is GovernedVaccinationRuleEngineEvaluationView => e !== null);
  const triggeredCount =
    typeof data.triggeredCount === "number"
      ? data.triggeredCount
      : evaluations.filter((e) => e.result === "TRIGGERED").length;

  return {
    payload: data,
    status: typeof data.status === "string" ? data.status : null,
    title: typeof data.title === "string" ? data.title : null,
    triggeredCount,
    evaluations,
    governance: { ...GOVERNED_DETERMINISTIC_CLINICAL_RULES_UI_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
    repositoryInvoked: false,
    executesAction: false,
    draftApproved: false,
    automaticDecision: false,
    usesLlm: false,
  };
}
