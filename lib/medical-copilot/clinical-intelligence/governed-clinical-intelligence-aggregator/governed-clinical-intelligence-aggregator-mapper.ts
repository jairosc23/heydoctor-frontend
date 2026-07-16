import { GOVERNED_CLINICAL_AI_ORCHESTRATOR_UI_GOVERNANCE, type GovernedClinicalIntelligenceAggregatorRefView, type GovernedClinicalIntelligenceAggregatorResult, type GovernedOrchestratorAggregatorView } from "./governed-clinical-intelligence-aggregator";
function mapRef(raw: unknown): GovernedClinicalIntelligenceAggregatorRefView | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.sourcePackage !== "string" || typeof r.surfaceKind !== "string") return null;
  return {
    sourcePackage: r.sourcePackage,
    surfaceKind: r.surfaceKind,
    metricLabel: typeof r.metricLabel === "string" ? r.metricLabel : "",
    metricValue: typeof r.metricValue === "number" ? r.metricValue : 0,
  };
}
function mapAgg(raw: unknown): GovernedOrchestratorAggregatorView | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  if (typeof a.kind !== "string") return null;
  const refs = Array.isArray(a.surfaceRefs) ? a.surfaceRefs.map(mapRef).filter((x): x is GovernedClinicalIntelligenceAggregatorRefView => x !== null) : [];
  return {
    order: typeof a.order === "number" ? a.order : 0,
    kind: a.kind,
    title: typeof a.title === "string" ? a.title : a.kind,
    summary: typeof a.summary === "string" ? a.summary : "",
    sourcePackages: Array.isArray(a.sourcePackages) ? a.sourcePackages.map(String) : [],
    surfaceRefs: refs,
  };
}
export function mapGovernedClinicalIntelligenceAggregatorEnvelope(payload: unknown): GovernedClinicalIntelligenceAggregatorResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.governance !== undefined || root.aggregators !== undefined || root.surfaceRefs !== undefined || root.clinicalOrchestratorRuntime !== undefined
    ? root : root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : null;
  if (!data) return null;
  let aggregators: GovernedOrchestratorAggregatorView[] = [];
  if (Array.isArray(data.aggregators)) {
    aggregators = data.aggregators.map(mapAgg).filter((x): x is GovernedOrchestratorAggregatorView => x !== null);
  } else if (data.clinicalOrchestratorRuntime) {
    for (const [, v] of Object.entries(data)) {
      if (v && typeof v === "object" && typeof (v as { kind?: string }).kind === "string" && Array.isArray((v as { surfaceRefs?: unknown[] }).surfaceRefs)) {
        const mapped = mapAgg(v);
        if (mapped) aggregators.push(mapped);
      }
    }
  }
  const surfaceRefs = Array.isArray(data.surfaceRefs)
    ? data.surfaceRefs.map(mapRef).filter((x): x is GovernedClinicalIntelligenceAggregatorRefView => x !== null)
    : aggregators.flatMap((a) => a.surfaceRefs);
  return {
    payload: data,
    status: typeof data.status === "string" ? data.status : null,
    title: typeof data.title === "string" ? data.title : null,
    aggregatorCount: typeof data.aggregatorCount === "number" ? data.aggregatorCount : aggregators.length,
    aggregators,
    certifiedSourcesIntegrated: Array.isArray(data.certifiedSourcesIntegrated) ? data.certifiedSourcesIntegrated.map(String) : [],
    surfaceRefs,
    sourcePackages: Array.isArray(data.sourcePackages) ? data.sourcePackages.map(String) : aggregators.flatMap((a) => a.sourcePackages),
    summary: typeof data.summary === "string" ? data.summary : null,
    governance: { ...GOVERNED_CLINICAL_AI_ORCHESTRATOR_UI_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true, persisted: false, writesEmr: false, repositoryInvoked: false, executesAction: false,
    draftApproved: false, automaticDecision: false, usesLlm: false, generatesNewClinicalContent: false,
  };
}
