import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalKnowledgeWorkflowEnvelope } from "./governed-clinical-knowledge-workflow-mapper";
describe("Clinical Knowledge Workflow", () => {
  it("maps workflow envelope with stages and HITL seals", () => {
    const mapped = mapGovernedClinicalKnowledgeWorkflowEnvelope({ status: "ok", data: {
      status: "READY_FOR_PHYSICIAN_REVIEW",
      title: "Clinical Knowledge Workflow",
      workflowId: "e2e_wf_1",
      workflowType: "clinical_knowledge_workflow",
      summary: "E2E mock",
      sourcePackages: ["medical_copilot_session"],
      surfaceRefs: [{ sourcePackage: "medical_copilot_session", surfaceKind: "workflow", present: true, metricLabel: "ready", metricValue: 1 }],
      currentStage: "hitl_review",
      nextStage: null,
      completedStages: ["session_bind"],
      pendingStages: [],
      workflowCount: 1,
      workflows: [{ order: 1, workflowId: "e2e_wf_1", workflowType: "clinical_knowledge_workflow", title: "Clinical Knowledge Workflow", summary: "E2E", sourcePackages: ["medical_copilot_session"], surfaceRefs: [{ sourcePackage: "medical_copilot_session", surfaceKind: "workflow", present: true, metricLabel: "ready", metricValue: 1 }], currentStage: "hitl_review", nextStage: null, completedStages: ["session_bind"], pendingStages: [] }],
      certifiedSourcesIntegrated: ["governed_clinical_ai_orchestrator_package"],
      generatesNewClinicalContent: false,
      executesWorkflow: false,
      governance: { requiresPhysicianReview: true, executesAction: false, usesLlm: false },
    }});
    assert.ok(mapped);
    assert.equal(mapped.usesLlm, false);
    assert.equal(mapped.executesWorkflow, false);
    assert.equal(mapped.workflowType, "clinical_knowledge_workflow");
    assert.ok(mapped.workflows.length >= 1);
  });
});
