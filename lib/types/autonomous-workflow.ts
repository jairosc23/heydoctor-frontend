export type WorkflowPlanCode =
  | "HTA_PLAN"
  | "DM2_PLAN"
  | "HTA_DM2_PLAN"
  | "GENERAL_PLAN";

export type WorkflowPlanDecision = "accepted" | "rejected" | "reviewed";

export type WorkflowPlanDiagnosis = {
  cie10CodeId: string;
  code: string;
  label: string;
  source: string;
};

export type WorkflowPlanItem = {
  id: string;
  label: string;
  category: "medication" | "lab" | "education" | "follow_up";
  reason: string;
  source: string;
  confidence: number;
  traceability: {
    ruleId?: string;
    diagnosisCode?: string;
    doctorDnaMatch?: boolean;
    intelligenceMatch?: boolean;
  };
};

export type WorkflowClinicalPlan = {
  planId: string;
  planCode: WorkflowPlanCode;
  planLabel: string;
  diagnosis: WorkflowPlanDiagnosis[];
  medications: WorkflowPlanItem[];
  labs: WorkflowPlanItem[];
  education: WorkflowPlanItem[];
  followUp: WorkflowPlanItem[];
  explanation: string;
  evidence: Array<{ kind: string; reference: string; detail?: string }>;
  generatedAt: string;
};

export type AutonomousWorkflowPlanResponse = {
  patientId: string;
  plan: WorkflowClinicalPlan | null;
  alternatePlans: WorkflowClinicalPlan[];
  generatedAt: string;
};
