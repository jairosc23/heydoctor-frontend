import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_PACKAGE_GOVERNANCE, type ClinicalReasoningPackage } from "./clinical-reasoning-package";
import { mapClinicalReasoningPackage, mapClinicalReasoningPackageEnvelope } from "./clinical-reasoning-package-mapper";
describe("AI-75 ClinicalReasoningPackage mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningPackage = {
      clinicalReasoningPackageId: "id1", providerId: "openai", packageSlots: [], governance: { ...CLINICAL_REASONING_PACKAGE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        governedClinicalReasoningSessionId: "x",
        clinicalReasoningRuntimeFoundationId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalReasoningPackageEnvelope({ clinicalReasoningPackage: { source: "clinical_reasoning_package", builderVersion: "1.0.0", clinicalReasoningPackage: model, governance: { ...CLINICAL_REASONING_PACKAGE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningPackage(null), null);
  });
});
