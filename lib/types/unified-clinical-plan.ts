export type UnifiedPlanItemCategory =
  | "medication"
  | "lab"
  | "education"
  | "follow_up";

export type UnifiedPlanSource =
  | "autonomous_workflow"
  | "care_pathway"
  | "clinical_flow"
  | "fallback_plan";

export type UnifiedClinicalPlanItem = {
  id: string;
  label: string;
  category: UnifiedPlanItemCategory;
  reason?: string;
  source: string;
  enabled: boolean;
  drugPresentationId?: string;
};

export type UnifiedClinicalPlan = {
  planId: string | null;
  title: string;
  explanation: string;
  source: UnifiedPlanSource;
  sourceLabel: string;
  pathwayCode?: string;
  diagnosisCode?: string;
  diagnosisLabel?: string;
  medications: UnifiedClinicalPlanItem[];
  labs: UnifiedClinicalPlanItem[];
  education: UnifiedClinicalPlanItem[];
  followUp: UnifiedClinicalPlanItem[];
};

export type UnifiedPlanViewMode = "summary" | "review" | "edit";

export type UnifiedPlanApplyResult = {
  prescriptionCreated: boolean;
  labOrderCreated: boolean;
  educationCount: number;
  followUpCount: number;
};
