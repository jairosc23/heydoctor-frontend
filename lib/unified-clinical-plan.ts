import type { WorkflowClinicalPlan } from "./types/autonomous-workflow";
import type { ClinicalFlowSuggestionsResponse } from "./types/clinical-intelligence-flow";
import type {
  UnifiedClinicalPlan,
  UnifiedClinicalPlanItem,
  UnifiedPlanSource,
} from "./types/unified-clinical-plan";

function workflowItem(
  item: {
    id: string;
    label: string;
    category: UnifiedClinicalPlanItem["category"];
    reason: string;
    source: string;
  },
  drugPresentationId?: string,
): UnifiedClinicalPlanItem {
  return {
    id: item.id,
    label: item.label,
    category: item.category,
    reason: item.reason,
    source: item.source,
    enabled: true,
    drugPresentationId,
  };
}

export function buildUnifiedPlanFromWorkflow(
  plan: WorkflowClinicalPlan,
): UnifiedClinicalPlan {
  const pathwayEvidence = plan.evidence.find((ev) => ev.kind === "care_pathway");
  const source: UnifiedPlanSource = pathwayEvidence
    ? "care_pathway"
    : "autonomous_workflow";
  const sourceLabel = pathwayEvidence
    ? `Care Pathway™ · ${pathwayEvidence.reference}`
    : "Autonomous Workflow™";

  return {
    planId: plan.planId,
    title: plan.planLabel,
    explanation: plan.explanation,
    source,
    sourceLabel,
    pathwayCode: pathwayEvidence?.reference,
    diagnosisCode: plan.diagnosis[0]?.code,
    diagnosisLabel: plan.diagnosis[0]?.label,
    medications: plan.medications.map((m) =>
      workflowItem({ ...m, category: "medication" }, m.id),
    ),
    labs: plan.labs.map((l) => workflowItem({ ...l, category: "lab" })),
    education: plan.education.map((e) =>
      workflowItem({ ...e, category: "education" }),
    ),
    followUp: plan.followUp.map((f) =>
      workflowItem({ ...f, category: "follow_up" }),
    ),
  };
}

export function buildUnifiedPlanFromFlow(
  flow: ClinicalFlowSuggestionsResponse,
): UnifiedClinicalPlan {
  return {
    planId: null,
    title: `Plan clínico — ${flow.diagnosis.code}`,
    explanation: `Sugerencias del Clinical Flow Engine™ para ${flow.diagnosis.description}.`,
    source: "clinical_flow",
    sourceLabel: "Clinical Flow Engine™",
    diagnosisCode: flow.diagnosis.code,
    diagnosisLabel: flow.diagnosis.description,
    medications: flow.medications.map((m) => ({
      id: m.id,
      label: m.displayLabel,
      category: "medication" as const,
      reason: m.ruleType,
      source: "clinical_flow",
      enabled: true,
      drugPresentationId: m.id,
    })),
    labs: flow.labs.map((l) => ({
      id: l.id,
      label: l.name,
      category: "lab" as const,
      reason: l.ruleType,
      source: "clinical_flow",
      enabled: true,
    })),
    education: flow.education.map((e) => ({
      id: e.id,
      label: e.title,
      category: "education" as const,
      reason: e.content,
      source: "clinical_flow",
      enabled: true,
    })),
    followUp: flow.followUp.map((f) => ({
      id: f.id,
      label: f.title,
      category: "follow_up" as const,
      reason: f.recommendation,
      source: "clinical_flow",
      enabled: true,
    })),
  };
}

export function unifiedPlanHasActions(plan: UnifiedClinicalPlan): boolean {
  return (
    plan.medications.some((i) => i.enabled) ||
    plan.labs.some((i) => i.enabled) ||
    plan.education.some((i) => i.enabled) ||
    plan.followUp.some((i) => i.enabled)
  );
}

export function countUnifiedPlanItems(plan: UnifiedClinicalPlan): number {
  return (
    plan.medications.filter((i) => i.enabled).length +
    plan.labs.filter((i) => i.enabled).length +
    plan.education.filter((i) => i.enabled).length +
    plan.followUp.filter((i) => i.enabled).length
  );
}

export function applyItemOverrides(
  plan: UnifiedClinicalPlan,
  overrides: Record<string, boolean>,
): UnifiedClinicalPlan {
  const mapItems = (items: UnifiedClinicalPlanItem[]) =>
    items.map((item) => ({
      ...item,
      enabled: overrides[item.id] ?? item.enabled,
    }));

  return {
    ...plan,
    medications: mapItems(plan.medications),
    labs: mapItems(plan.labs),
    education: mapItems(plan.education),
    followUp: mapItems(plan.followUp),
  };
}
