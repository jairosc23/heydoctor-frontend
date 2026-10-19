import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_INPUTS_GOVERNANCE, type ClinicalReasoningInputs } from "./clinical-reasoning-inputs";
import { mapClinicalReasoningInputs, mapClinicalReasoningInputsEnvelope } from "./clinical-reasoning-inputs-mapper";
describe("AI-58 ClinicalReasoningInputs mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningInputs = {
      clinicalReasoningInputsId: "id1", providerId: "openai", inputSlots: [], governance: { ...CLINICAL_REASONING_INPUTS_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        evidenceGraphWorkspaceId: "x",
        clinicalPatternWorkspaceId: "x",
        confidenceId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalReasoningInputsEnvelope({ clinicalReasoningInputs: { source: "clinical_reasoning_inputs", builderVersion: "1.0.0", clinicalReasoningInputs: model, governance: { ...CLINICAL_REASONING_INPUTS_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningInputs(null), null);
  });
});
