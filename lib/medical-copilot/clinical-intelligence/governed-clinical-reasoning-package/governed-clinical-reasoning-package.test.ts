import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_REASONING_PACKAGE_GOVERNANCE, type GovernedClinicalReasoningPackage } from "./governed-clinical-reasoning-package";
import { mapGovernedClinicalReasoningPackage, mapGovernedClinicalReasoningPackageEnvelope } from "./governed-clinical-reasoning-package-mapper";

describe("AI-50 GovernedClinicalReasoningPackage mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedClinicalReasoningPackage = {
      clinicalReasoningPackageId: "id1",
      providerId: "openai",
      packageSlots: [],
      governance: { ...GOVERNED_CLINICAL_REASONING_PACKAGE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        physicianReasoningPreparationId: "x",
        assessmentPackageId: "x",
        reviewSessionId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        confidenceId: "x",
        evidenceMappingId: "x",
        differentialId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedClinicalReasoningPackageEnvelope({
      clinicalReasoningPackage: {
        source: "governed_clinical_reasoning_package",
        builderVersion: "1.0.0",
        clinicalReasoningPackage: model,
        governance: { ...GOVERNED_CLINICAL_REASONING_PACKAGE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedClinicalReasoningPackage(null), null);
  });
});
