import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildUnifiedPlanFromWorkflow,
  resolveUnifiedClinicalPlan,
  unifiedPlanHasActions,
} from "./unified-clinical-plan";
import type { WorkflowClinicalPlan } from "./types/autonomous-workflow";

const EMPTY_WORKFLOW_PLAN: WorkflowClinicalPlan = {
  planId: "wf-1",
  planCode: "GENERAL_PLAN",
  planLabel: "Plan vacío",
  explanation: "Sin acciones",
  diagnosis: [
    {
      cie10CodeId: "cie10-i10",
      code: "I10",
      label: "Hipertensión esencial",
      source: "consultation",
    },
  ],
  evidence: [],
  medications: [],
  labs: [],
  education: [],
  followUp: [],
  generatedAt: new Date().toISOString(),
};

describe("resolveUnifiedClinicalPlan", () => {
  it("usa fallback cuando workflow y flow están vacíos pero hay diagnóstico", () => {
    const plan = resolveUnifiedClinicalPlan({
      workflowPlan: EMPTY_WORKFLOW_PLAN,
      flow: {
        diagnosis: { cie10CodeId: "x", code: "I10", description: "HTA" },
        jurisdiction: "CL",
        medications: [],
        labs: [],
        education: [],
        followUp: [],
      },
      diagnosisCode: "I10",
      diagnosisLabel: "Hipertensión esencial",
    });
    assert.ok(plan);
    assert.equal(plan!.source, "fallback_plan");
    assert.ok(unifiedPlanHasActions(plan!));
  });

  it("prioriza workflow con ítems sobre fallback", () => {
    const richPlan: WorkflowClinicalPlan = {
      ...EMPTY_WORKFLOW_PLAN,
      education: [
        {
          id: "e1",
          label: "Educación workflow",
          category: "education",
          reason: "test",
          source: "workflow",
          confidence: 0.9,
          traceability: {},
        },
      ],
    };
    const plan = resolveUnifiedClinicalPlan({
      workflowPlan: richPlan,
      diagnosisCode: "I10",
    });
    assert.equal(plan!.source, "autonomous_workflow");
    assert.ok(unifiedPlanHasActions(buildUnifiedPlanFromWorkflow(richPlan)));
  });
});
