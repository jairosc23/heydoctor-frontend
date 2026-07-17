import { GOVERNED_CLINICAL_REASONING_PIPELINE_UI_GOVERNANCE, type GovernedClinicalIntelligenceStageResult, type GovernedClinicalIntelligenceStageStageView, type GovernedClinicalIntelligenceStageSurfaceRefView } from "./governed-clinical-intelligence-stage";

function mapRef(raw: unknown): GovernedClinicalIntelligenceStageSurfaceRefView | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.surfaceKind !== "string") return null;
  return {
    sourcePackage: typeof r.sourcePackage === "string" ? r.sourcePackage : "",
    surfaceKind: r.surfaceKind,
    metricLabel: typeof r.metricLabel === "string" ? r.metricLabel : "metric",
    metricValue: typeof r.metricValue === "number" ? r.metricValue : 0,
  };
}

function mapStage(raw: unknown): GovernedClinicalIntelligenceStageStageView | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.kind !== "string") return null;
  const refs = Array.isArray(s.surfaceRefs) ? s.surfaceRefs.map(mapRef).filter((x): x is GovernedClinicalIntelligenceStageSurfaceRefView => x !== null) : [];
  return {
    order: typeof s.order === "number" ? s.order : 0,
    kind: s.kind,
    title: typeof s.title === "string" ? s.title : s.kind,
    summary: typeof s.summary === "string" ? s.summary : "",
    sourcePackages: Array.isArray(s.sourcePackages) ? s.sourcePackages.map(String) : [],
    surfaceRefs: refs,
  };
}

export function mapGovernedClinicalIntelligenceStageEnvelope(payload: unknown): GovernedClinicalIntelligenceStageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.governance !== undefined || root.stages !== undefined || root.kind !== undefined || root.pipelineId !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  let stages: GovernedClinicalIntelligenceStageStageView[] = [];
  if (Array.isArray(data.stages)) {
    stages = data.stages.map(mapStage).filter((x): x is GovernedClinicalIntelligenceStageStageView => x !== null);
  } else if (typeof data.kind === "string") {
    const single = mapStage(data);
    if (single) stages = [single];
  }

  return {
    payload: data,
    status: typeof data.status === "string" ? data.status : null,
    title: typeof data.title === "string" ? data.title : null,
    stageCount: typeof data.stageCount === "number" ? data.stageCount : stages.length,
    stages,
    certifiedSourcesIntegrated: Array.isArray(data.certifiedSourcesIntegrated) ? data.certifiedSourcesIntegrated.map(String) : [],
    governance: { ...GOVERNED_CLINICAL_REASONING_PIPELINE_UI_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
    repositoryInvoked: false,
    executesAction: false,
    draftApproved: false,
    automaticDecision: false,
    usesLlm: false,
    generatesNewClinicalContent: false,
  };
}
