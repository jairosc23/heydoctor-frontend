import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_REASONING_PREPARATION_GOVERNANCE, type GovernedReasoningPreparation } from "./governed-reasoning-preparation";
import { mapGovernedReasoningPreparation, mapGovernedReasoningPreparationEnvelope } from "./governed-reasoning-preparation-mapper";
describe("AI-59 GovernedReasoningPreparation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedReasoningPreparation = {
      governedReasoningPreparationId: "id1", providerId: "openai", preparationSlots: [], governance: { ...GOVERNED_REASONING_PREPARATION_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningInputsId: "x",
        governedReasoningWorkspaceId: "x",
        physicianReasoningPreparationId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapGovernedReasoningPreparationEnvelope({ governedReasoningPreparation: { source: "governed_reasoning_preparation", builderVersion: "1.0.0", governedReasoningPreparation: model, governance: { ...GOVERNED_REASONING_PREPARATION_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedReasoningPreparation(null), null);
  });
});
