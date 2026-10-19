import { GOVERNED_CLINICAL_WORKFLOW_ENGINE_UI_GOVERNANCE, type GovernedClinicalAuditWorkflowRefView, type GovernedClinicalAuditWorkflowResult, type GovernedClinicalWorkflowView } from "./governed-clinical-audit-workflow";
function mapRef(raw: unknown): GovernedClinicalAuditWorkflowRefView | null {
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
function mapWf(raw: unknown): GovernedClinicalWorkflowView | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  if (typeof a.workflowType !== "string" && typeof a.kind !== "string") return null;
  const refs = Array.isArray(a.surfaceRefs) ? a.surfaceRefs.map(mapRef).filter((x): x is GovernedClinicalAuditWorkflowRefView => x !== null) : [];
  return {
    order: typeof a.order === "number" ? a.order : 0,
    workflowId: typeof a.workflowId === "string" ? a.workflowId : "",
    workflowType: typeof a.workflowType === "string" ? a.workflowType : String(a.kind ?? ""),
    title: typeof a.title === "string" ? a.title : String(a.workflowType ?? a.kind ?? ""),
    summary: typeof a.summary === "string" ? a.summary : "",
    sourcePackages: Array.isArray(a.sourcePackages) ? a.sourcePackages.map(String) : [],
    surfaceRefs: refs,
    currentStage: typeof a.currentStage === "string" ? a.currentStage : "",
    nextStage: typeof a.nextStage === "string" ? a.nextStage : null,
    completedStages: Array.isArray(a.completedStages) ? a.completedStages.map(String) : [],
    pendingStages: Array.isArray(a.pendingStages) ? a.pendingStages.map(String) : [],
  };
}
export function mapGovernedClinicalAuditWorkflowEnvelope(payload: unknown): GovernedClinicalAuditWorkflowResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.governance !== undefined || root.workflows !== undefined || root.workflowType !== undefined || root.surfaceRefs !== undefined
    ? root : root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : null;
  if (!data) return null;
  let workflows: GovernedClinicalWorkflowView[] = [];
  if (Array.isArray(data.workflows)) {
    workflows = data.workflows.map(mapWf).filter((x): x is GovernedClinicalWorkflowView => x !== null);
  } else if (typeof data.workflowType === "string" || typeof data.kind === "string") {
    const mapped = mapWf(data);
    if (mapped) workflows = [mapped];
  } else {
    for (const [, v] of Object.entries(data)) {
      if (v && typeof v === "object" && (typeof (v as { workflowType?: string }).workflowType === "string" || Array.isArray((v as { surfaceRefs?: unknown[] }).surfaceRefs))) {
        const mapped = mapWf(v);
        if (mapped) workflows.push(mapped);
      }
    }
  }
  const primary = workflows[0];
  const surfaceRefs = Array.isArray(data.surfaceRefs)
    ? data.surfaceRefs.map(mapRef).filter((x): x is GovernedClinicalAuditWorkflowRefView => x !== null)
    : workflows.flatMap((w) => w.surfaceRefs);
  return {
    payload: data,
    status: typeof data.status === "string" ? data.status : null,
    title: typeof data.title === "string" ? data.title : primary?.title ?? null,
    workflowCount: typeof data.workflowCount === "number" ? data.workflowCount : workflows.length,
    workflows,
    certifiedSourcesIntegrated: Array.isArray(data.certifiedSourcesIntegrated) ? data.certifiedSourcesIntegrated.map(String) : [],
    surfaceRefs,
    sourcePackages: Array.isArray(data.sourcePackages) ? data.sourcePackages.map(String) : primary?.sourcePackages ?? [],
    summary: typeof data.summary === "string" ? data.summary : primary?.summary ?? null,
    workflowId: typeof data.workflowId === "string" ? data.workflowId : primary?.workflowId ?? null,
    workflowType: typeof data.workflowType === "string" ? data.workflowType : primary?.workflowType ?? null,
    currentStage: typeof data.currentStage === "string" ? data.currentStage : primary?.currentStage ?? null,
    nextStage: typeof data.nextStage === "string" ? data.nextStage : primary?.nextStage ?? null,
    completedStages: Array.isArray(data.completedStages) ? data.completedStages.map(String) : primary?.completedStages ?? [],
    pendingStages: Array.isArray(data.pendingStages) ? data.pendingStages.map(String) : primary?.pendingStages ?? [],
    governance: { ...GOVERNED_CLINICAL_WORKFLOW_ENGINE_UI_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true, persisted: false, writesEmr: false, repositoryInvoked: false, executesAction: false,
    draftApproved: false, automaticDecision: false, usesLlm: false, generatesNewClinicalContent: false, executesWorkflow: false,
  };
}
