import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_GOVERNANCE, type GovernedClinicalReasoningInputPackage } from "./governed-clinical-reasoning-input-package";
import { mapGovernedClinicalReasoningInputPackage, mapGovernedClinicalReasoningInputPackageEnvelope } from "./governed-clinical-reasoning-input-package-mapper";
describe("AI-60 GovernedClinicalReasoningInputPackage mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedClinicalReasoningInputPackage = {
      clinicalReasoningInputPackageId: "id1", providerId: "openai", inputPackageSlots: [], governance: { ...GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        governedReasoningPreparationId: "x",
        governedClinicalReasoningDatasetId: "x",
        clinicalReasoningPackageId: "x",
        reviewSessionId: "x",
        assessmentPackageId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapGovernedClinicalReasoningInputPackageEnvelope({ clinicalReasoningInputPackage: { source: "governed_clinical_reasoning_input_package", builderVersion: "1.0.0", clinicalReasoningInputPackage: model, governance: { ...GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedClinicalReasoningInputPackage(null), null);
  });
});
